"use client";

import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import type { Mode } from "@/config/modes";
import { lobbyCopy as copy, lobbyServices, type LobbyService } from "@/data/lobbyServices";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Icon } from "@/components/ui/Icon";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { useIntroReady } from "@/lib/intro";
import { LobbyScene } from "./LobbyScene";
import { ServiceDialog } from "./ServiceDialog";
import styles from "./ReceptionLobby.module.css";

type Speaker = "guard" | "receptionist" | "customer";
type Bubble = { text: string; show: boolean };
type SceneState = {
  bubbles: Record<Speaker, Bubble>;
  walking: boolean;
  greeting: { guard: boolean; receptionist: boolean };
};

const speakers: readonly Speaker[] = ["guard", "receptionist", "customer"];

/** Where each speech bubble points, in scene units (the SVG is 1000×460). */
const anchors: Record<Speaker, { x: number; y: number }> = {
  guard: { x: 378, y: 186 },
  receptionist: { x: 790, y: 172 },
  customer: { x: 590, y: 186 },
};

/** How much of the scene must be on screen for the visit to start. */
const VISIBLE_SHARE = 0.35;

/** Before the visit. The receptionist's greeting is in place for visitors without JavaScript. */
const waiting: SceneState = {
  bubbles: {
    guard: { text: "", show: false },
    receptionist: { text: copy.lines.greeting, show: false },
    customer: { text: "", show: false },
  },
  walking: false,
  greeting: { guard: false, receptionist: false },
};

/**
 * The lobby story and service menu. One GSAP timeline plays the visit when the
 * scene is 35% in view: the visitor walks to the gate, the guard opens it, the
 * visitor walks to the desk, reception greets them and the menu springs in.
 * Picking a service opens its details in a dialog that grows from the card.
 */
export function LobbyStory({ set }: { set: Mode }) {
  const services = lobbyServices[set];
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const uid = `lobby${useId().replace(/[^\w-]/g, "")}`;
  const reduced = useReducedMotionSoft();
  const introReady = useIntroReady();
  // True in the server HTML, so the idle loops run for visitors without JavaScript.
  const [onScreen, setOnScreen] = useState(true);
  const [scene, setScene] = useState<SceneState>(waiting);
  const [announcement, setAnnouncement] = useState("");
  const [chosen, setChosen] = useState<{ service: LobbyService; card: HTMLElement } | null>(null);
  const story = useRef<gsap.core.Timeline | null>(null);
  // Survives Next.js hiding the page, so a finished visit isn't replayed on return.
  const status = useRef<"waiting" | "playing" | "done">("waiting");

  const say = (who: Speaker, text: string) => {
    setScene((current) => ({ ...current, bubbles: { ...current.bubbles, [who]: { text, show: true } } }));
    setAnnouncement(`${copy.speakers[who]}: ${text}`);
  };
  const hush = (who: Speaker) =>
    setScene((current) => ({
      ...current,
      bubbles: { ...current.bubbles, [who]: { ...current.bubbles[who], show: false } },
    }));
  const walk = (walking: boolean) => setScene((current) => ({ ...current, walking }));
  const greet = (who: "guard" | "receptionist", greeting: boolean) =>
    setScene((current) => ({ ...current, greeting: { ...current.greeting, [who]: greeting } }));

  /** Put the visitor back outside, hide the menu and build the visit as a paused timeline. */
  const createStory = () => {
    const q = gsap.utils.selector(root);
    const customer = q('[data-lobby="customer"]');
    const doorLeft = q('[data-lobby="door-left"]');
    const doorRight = q('[data-lobby="door-right"]');
    const doors = [...doorLeft, ...doorRight];
    const glow = q('[data-lobby="glow"]');
    const cards = q("[data-lobby-card]");

    story.current?.kill();
    setScene(waiting);
    gsap.set(customer, { x: -60, y: 380, opacity: 1 });
    gsap.set(doors, { x: 0 });
    gsap.set(glow, { opacity: 0 });
    gsap.set(q('[data-lobby="beam"]'), { scaleY: 0 });
    gsap.set(cards, { opacity: 0, y: reduced ? 0 : 40 });

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        status.current = "done";
      },
    });

    if (reduced) {
      // Softer: the visitor fades in at the gate and again at the desk instead of walking.
      tl.set(customer, { x: 170, opacity: 0 })
        .to(customer, { opacity: 1, duration: 0.4 })
        .add(() => {
          greet("guard", true);
          say("guard", copy.lines.guardWelcome);
        })
        .to(glow, { opacity: 0.18, duration: 0.3 }, "+=1")
        .to(doorLeft, { x: -48, duration: 0.5 }, "<")
        .to(doorRight, { x: 48, duration: 0.5 }, "<")
        .add(() => {
          greet("guard", false);
          say("guard", copy.lines.guardDirections);
        })
        .to(customer, { opacity: 0, duration: 0.3 }, "+=1")
        .set(customer, { x: 590 })
        .add(() => hush("guard"))
        .to(customer, { opacity: 1, duration: 0.4 })
        .to(doors, { x: 0, duration: 0.5 }, "<")
        .to(glow, { opacity: 0, duration: 0.3 }, "<");
    } else {
      tl.add(() => walk(true))
        .to(customer, { x: 170, duration: 2.3, ease: "none" })
        .add(() => {
          walk(false);
          greet("guard", true);
          say("guard", copy.lines.guardWelcome);
        })
        .to(glow, { opacity: 0.18, duration: 0.3 }, "+=1")
        .to(doorLeft, { x: -48, duration: 0.9, ease: "power2.inOut" }, "<")
        .to(doorRight, { x: 48, duration: 0.9, ease: "power2.inOut" }, "<")
        .add(() => {
          greet("guard", false);
          say("guard", copy.lines.guardDirections);
          walk(true);
        })
        .to(customer, { x: 590, duration: 3.3, ease: "none" })
        .add(() => hush("guard"), "-=1.8")
        .to(doors, { x: 0, duration: 0.9, ease: "power2.inOut" }, "-=1.7")
        .to(glow, { opacity: 0, duration: 0.4 }, "<")
        .add(() => walk(false));
    }

    tl.add(() => {
      greet("receptionist", true);
      say("receptionist", copy.lines.greeting);
    })
      .add(() => say("customer", copy.lines.reply), "+=1.1")
      .to(q('[data-lobby="beam"]'), { scaleY: 1, duration: reduced ? 0.3 : 0.5, ease: "power2.out" }, "+=0.3")
      .to(
        cards,
        reduced
          ? { opacity: 1, duration: 0.3, stagger: 0.05 }
          : { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.6)" },
      )
      .add(() => {
        hush("customer");
        greet("receptionist", false);
      }, "+=1.4");

    story.current = tl;
    return tl;
  };

  // Build the visit (or show its end if it already played). Also runs again when Next.js
  // shows this page after hiding it; a visit cut short then starts over once in view.
  const { contextSafe } = useGSAP(
    () => {
      const tl = createStory();
      if (status.current === "done") tl.progress(1);
      else status.current = "waiting";
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  // Start the visit when the scene is 35% in view. A fresh observer each time the page is
  // shown reports where the scene really is, rather than a flag left over from before.
  useEffect(() => {
    const element = frame.current;
    if (!element || !introReady) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < VISIBLE_SHARE || status.current !== "waiting" || !story.current) return;
        status.current = "playing";
        story.current.play();
      },
      { threshold: VISIBLE_SHARE },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [introReady, reduced]);

  // Pause the scene's idle loops while it's off screen.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /** Jump to the end of the visit, e.g. when someone reaches the menu before it has appeared. */
  const finish = () => {
    if (status.current === "done" || !story.current) return;
    story.current.progress(1);
    status.current = "done";
  };

  // Handlers wrap their work in contextSafe when they run, so the tweens they make are cleaned up with the rest.
  const replay = () =>
    contextSafe(() => {
      status.current = "playing";
      createStory().play();
    })();

  const choose = (service: LobbyService, card: HTMLElement) =>
    contextSafe(() => {
      finish();
      say("receptionist", copy.lines.choice);
      greet("receptionist", true);
      gsap.delayedCall(1.6, () => greet("receptionist", false));
      if (!reduced) {
        gsap.fromTo(
          gsap.utils.selector(root)('[data-lobby="customer"]'),
          { y: 380 },
          { y: 356, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" },
        );
      }
      setChosen({ service, card });
    })();

  return (
    <div ref={root}>
      <div ref={frame} className="glass glass-sheen relative rounded-[28px]">
        <LobbyScene
          uid={uid}
          paused={!onScreen}
          customerWalking={scene.walking}
          guardGreeting={scene.greeting.guard}
          receptionistGreeting={scene.greeting.receptionist}
        />
        {speakers.map((who) => {
          const bubble = scene.bubbles[who];
          return (
            <p
              key={who}
              aria-hidden="true"
              data-role={who}
              data-show={bubble.show || undefined}
              data-nojs={who === "receptionist" || undefined}
              className={styles.bubble}
              style={{ left: `${anchors[who].x / 10}%`, top: `${anchors[who].y / 4.6}%` }}
            >
              {bubble.text}
            </p>
          );
        })}
        {/* Screen readers hear each line once, with who said it. */}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>

      <div className="relative mt-7">
        <span aria-hidden="true" data-lobby="beam" className={styles.beam} />
        <h3 className="mb-3.5 text-xl font-extrabold tracking-normal">{copy.ask}</h3>
        {/* Three columns on desktop, so the six services sit in two even rows. */}
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3 p-0 noscript:hidden">
          {services.map((service) => (
            <li key={service.title} data-lobby-card="" data-reveal="">
              <button
                type="button"
                aria-haspopup="dialog"
                data-cursor="Open"
                className={clsx("glass glass-sheen", styles.card)}
                onFocus={finish}
                onClick={(event) => choose(service, event.currentTarget)}
              >
                <span className="grid size-11.5 flex-none place-items-center rounded-[13px] bg-lime text-on-lime">
                  <Icon name={service.icon} />
                </span>
                <span>
                  <b className="block leading-tight">{service.title}</b>
                  <small className="text-fg-2">{service.summary}</small>
                </span>
                <Icon name="arrowRight" size={18} strokeWidth={2.4} className={styles.arrow} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end noscript:hidden">
          <AnimatedButton size="sm" onClick={replay}>
            {copy.replay}
          </AnimatedButton>
        </div>

        {/* Without JavaScript the cards can't open, so every service's details are listed in their place. */}
        <noscript>
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
            {services.map((service) => (
              <li key={service.title} className="glass rounded-[18px] p-5">
                <b className="block font-display text-lg">{service.title}</b>
                <p className="my-2 text-fg-2">{service.description}</p>
                <ul aria-label={copy.dialog.included} className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm font-semibold">
                  {service.included.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </noscript>
      </div>

      <ServiceDialog
        service={chosen?.service ?? null}
        origin={chosen?.card ?? null}
        onClosed={() => setChosen(null)}
      />
    </div>
  );
}
