"use client";

import clsx from "clsx";
import { useInView } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { shopifyHero as copy } from "@/data/shopify";
import { HeroRobotScene } from "@/components/characters/scenes";
import { Stage3D } from "@/components/characters/Stage3D";
import { ModeSwitchLink } from "@/components/layout/ModeSwitchLink";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Highlight } from "@/components/ui/Highlight";
import { Icon } from "@/components/ui/Icon";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { usePointer } from "@/lib/hooks/usePointer";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { useIntroReady } from "@/lib/intro";
import styles from "./Hero.module.css";

const ROTATE_EVERY_MS = 2600;

/** Letters as inline-block spans (for the rise-in), keeping words together on a line. */
function Letters({ text, rotating = false }: { text: string; rotating?: boolean }) {
  return text.split(" ").map((word, wordIndex, words) => (
    <span key={wordIndex} className="inline-block whitespace-nowrap">
      {Array.from(word).map((char, charIndex) => (
        <span key={charIndex} data-hero-char="" data-rot-char={rotating ? "" : undefined} className="inline-block">
          {char}
        </span>
      ))}
      {wordIndex < words.length - 1 && " "}
    </span>
  ));
}

/**
 * Shopify home hero: letter-by-letter headline with a rotating last line, lime
 * highlight, the 3D robot in its AI sphere, floating notification chips with
 * mouse parallax, perspective floor and glows. The intro waits for the
 * first-visit loader; as you scroll away the copy lifts and the robot turns.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const chipLayer = useRef<HTMLDivElement>(null);
  const robotScroll = useRef(0);
  const introReady = useIntroReady();
  const reduced = useReducedMotionSoft();
  const wide = useMediaQuery("(min-width: 901px)");
  const { fine } = usePointer();
  const inView = useInView(root, { amount: 0.2 });

  const [highlightOn, setHighlightOn] = useState(false);
  const [rotationOn, setRotationOn] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const swapped = useRef(false);

  // Intro: letters rise, copy and chips arrive, then the word starts rotating.
  useGSAP(
    () => {
      const hero = root.current;
      if (!introReady || !hero) return;
      const q = gsap.utils.selector(hero);
      const tl = gsap.timeline();
      hero.dataset.intro = "playing";

      if (reduced) {
        tl.fromTo(
          [...q("h1"), ...q("[data-hero-fade]"), ...q("[data-hero-chip]"), ...q("[data-hero-robot]")],
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.05 },
        )
          .fromTo(q("[data-hero-backdrop]"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
          .call(() => setHighlightOn(true), [], 0.2)
          .call(() => setRotationOn(true));
        return;
      }

      tl.fromTo(
        q("[data-hero-char]"),
        { yPercent: 120, rotate: 10 },
        { yPercent: 0, rotate: 0, duration: 1.1, ease: "expo.out", stagger: 0.022 },
      )
        .fromTo(
          q("[data-hero-fade]"),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
          "-=0.8",
        )
        .fromTo(q("[data-hero-backdrop='floor']"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0)
        .fromTo(q("[data-hero-robot]"), { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 1.8, ease: "power2.out" }, 0)
        .fromTo(q("[data-hero-backdrop='hint']"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3")
        .fromTo(
          q("[data-hero-chip]"),
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, stagger: 0.15, ease: "back.out(2)" },
          "-=1",
        )
        .call(() => setHighlightOn(true), [], "-=1.6")
        .call(() => setRotationOn(true));
    },
    { scope: root, dependencies: [introReady, reduced], revertOnUpdate: true },
  );

  // Each new rotating word flips in from below (the first word arrives with the intro).
  useGSAP(
    () => {
      if (!swapped.current) return;
      gsap.fromTo(
        gsap.utils.selector(root)("[data-rot-char]"),
        reduced ? { opacity: 0 } : { yPercent: 120, rotate: 12, opacity: 1 },
        reduced
          ? { opacity: 1, duration: 0.3 }
          : { yPercent: 0, rotate: 0, duration: 0.7, ease: "expo.out", stagger: 0.025 },
      );
    },
    { scope: root, dependencies: [wordIndex] },
  );

  // Every 2.6s the current word flips out upward, then the next one renders.
  const { contextSafe } = useGSAP({ scope: root });
  useEffect(() => {
    if (!rotationOn || !inView) return;
    const flipOut = contextSafe(() => {
      if (document.hidden) return;
      gsap.to(gsap.utils.selector(root)("[data-rot-char]"), {
        ...(reduced ? { opacity: 0, duration: 0.25 } : { yPercent: -120, opacity: 0, duration: 0.35, stagger: 0.02 }),
        ease: "power3.in",
        onComplete: () => {
          swapped.current = true;
          setWordIndex((index) => (index + 1) % copy.rotatingWords.length);
        },
      });
    });
    const timer = window.setInterval(flipOut, ROTATE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [rotationOn, inView, reduced, contextSafe]);

  // Chips drift with the mouse at different depths (desktop, motion allowed).
  useGSAP(
    () => {
      if (!fine || reduced) return;
      const chips = gsap.utils.selector(root)("[data-hero-chip]") as HTMLElement[];
      const followers = chips.map((chip) => ({
        depth: Number(chip.dataset.depth),
        x: gsap.quickTo(chip, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(chip, "y", { duration: 0.9, ease: "power3" }),
      }));
      const onMove = (event: PointerEvent) => {
        const dx = event.clientX / window.innerWidth - 0.5;
        const dy = event.clientY / window.innerHeight - 0.5;
        followers.forEach((f) => {
          f.x(dx * f.depth);
          f.y(dy * f.depth);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root, dependencies: [fine, reduced], revertOnUpdate: true },
  );

  // As you scroll away, the copy lifts and fades, the chips float off and the robot's world turns.
  useGSAP(
    () => {
      if (reduced || !root.current) return;
      const trigger = { trigger: root.current, start: "top top", scrub: true };
      gsap.to(inner.current, {
        yPercent: -25,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          ...trigger,
          end: "bottom top",
          onUpdate: (self) => {
            robotScroll.current = self.progress;
          },
        },
      });
      gsap.to(chipLayer.current, { yPercent: -35, opacity: 0, ease: "none", scrollTrigger: { ...trigger, end: "80% top" } });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-intro="pending" className={styles.hero} aria-labelledby="hero-title">
      <div aria-hidden="true" data-hero-backdrop="floor" className={styles.floor}>
        <div className={styles.grid} />
      </div>
      <div aria-hidden="true" className={styles.glow} />
      <div aria-hidden="true" className={clsx(styles.glow, styles.glowLime)} />

      <Stage3D
        aria-hidden="true"
        data-hero-robot=""
        className={styles.robot}
        scene={HeroRobotScene}
        sceneProps={{ layout: wide ? "wide" : "narrow", scroll: robotScroll, reduced }}
        eager
      />

      <div ref={chipLayer} aria-hidden="true" className={styles.chips}>
        {copy.chips.map((chip, index) => (
          <div
            key={chip.title}
            data-hero-chip=""
            data-depth={chip.depth}
            className={clsx(styles.chip, !chip.mobile && styles.desktopOnly)}
            style={
              {
                "--x": `${chip.desktop[0]}%`,
                "--y": `${chip.desktop[1]}%`,
                "--mx": chip.mobile ? `${chip.mobile[0]}%` : undefined,
                "--my": chip.mobile ? `${chip.mobile[1]}%` : undefined,
              } as CSSProperties
            }
          >
            <div className={styles.chipCard} style={{ "--float-delay": `${index * -1.3}s` } as CSSProperties}>
              <span className={styles.chipIcon} style={{ "--tint": chip.color } as CSSProperties}>
                <Icon name={chip.icon} size={18} strokeWidth={2.4} />
              </span>
              <span>
                <b>{chip.title}</b>
                <small>{chip.detail}</small>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div ref={inner} className="wrap relative z-2 w-full pt-27.5 pb-22.5 max-[900px]:pt-24 max-[900px]:pb-[42vh]">
        <p data-hero-fade="" className="mb-5 font-semibold text-fg-2">
          {copy.kicker}
        </p>
        <h1
          id="hero-title"
          className="mb-7.5 max-w-[9.5em] text-[clamp(3rem,9vw,8.4rem)] leading-[0.9] font-extrabold tracking-tighter"
        >
          <span className="sr-only">{`${copy.titleLines.join(" ")} ${copy.rotatingWords[0]}`}</span>
          <span aria-hidden="true">
            {copy.titleLines.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <Letters text={line} />
              </span>
            ))}
            <span className="block overflow-hidden pb-[0.06em] text-violet">
              <span key={wordIndex} className="serif-accent inline-block whitespace-nowrap">
                <Letters text={copy.rotatingWords[wordIndex]} rotating />
              </span>
            </span>
          </span>
        </h1>
        <p className="mb-7.5 font-display text-[clamp(1.05rem,2vw,1.3rem)] tracking-[-0.01em]">
          <Highlight play={highlightOn}>{copy.highlight}</Highlight>
        </p>
        <p data-hero-fade="" className="mb-8.5 max-w-[30em] text-[1.2rem] text-fg-2">
          {copy.subtitle}
        </p>
        <div data-hero-fade="" className="flex flex-wrap gap-3">
          <AnimatedButton href={copy.primaryCta.href} variant="primary">
            {copy.primaryCta.label}
          </AnimatedButton>
          <AnimatedButton href={copy.secondaryCta.href}>{copy.secondaryCta.label}</AnimatedButton>
        </div>
        <div data-hero-fade="">
          <ModeSwitchLink from="shop" />
        </div>
      </div>

      <div aria-hidden="true" data-hero-backdrop="hint" className={styles.hint}>
        {copy.scrollHint}
        <i />
      </div>
    </section>
  );
}
