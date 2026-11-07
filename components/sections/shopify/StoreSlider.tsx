"use client";

import { useAnimate, useInView } from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { domainOf, storeGradient, type Project } from "@/data/projects";
import { storesSection as copy } from "@/data/shopify";
import { BrowserBar } from "@/components/ui/BrowserBar";
import { Icon } from "@/components/ui/Icon";
import { useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./StoreSlider.module.css";

const AUTOPLAY_MS = 2800;
/** Cards further than this many steps from the front are hidden. */
const VISIBLE_STEPS = 3.3;
/** Fraction of a card width between neighbouring cards. */
const SPACING = 0.62;

/** Offset of card `index` from the front card, wrapped to the shortest way round. */
function offsetOf(index: number, current: number, total: number) {
  let offset = index - current;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

/** Coverflow placement: each step back turns 30°, sinks 150px and shrinks 7%. */
function placement(offset: number) {
  const distance = Math.abs(offset);
  const turn = Math.max(-55, Math.min(55, -offset * 30));
  return {
    transform: `translate(-50%, -50%) translateX(calc(var(--card-width) * ${(offset * SPACING).toFixed(3)})) translateZ(${(-distance * 150).toFixed(1)}px) rotateY(${turn.toFixed(1)}deg) scale(${Math.max(0.6, 1 - distance * 0.07).toFixed(3)})`,
    opacity: distance > VISIBLE_STEPS ? "0" : "1",
    zIndex: String(100 - Math.round(distance * 10)),
    pointerEvents: distance > VISIBLE_STEPS ? "none" : "",
  };
}

/**
 * Every store as a 3D coverflow. Autoplays every 2.8s while visible (paused on
 * hover, focus and with reduced motion); drag or swipe, the arrow buttons or the
 * arrow keys move it. A side card comes to the front when clicked; the front
 * card opens the live store.
 */
export function StoreSlider({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const region = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [paused, setPaused] = useState(false);
  const inView = useInView(region, { amount: 0.3 });
  const reduced = useReducedMotionSoft();
  const drag = useRef({ startX: 0, active: false, moved: false, offset: 0 });

  const layout = useCallback(
    (front: number, dragOffset = 0) => {
      cards.current.forEach((card, index) => {
        if (card) Object.assign(card.style, placement(offsetOf(index, front, total) + dragOffset));
      });
    },
    [total],
  );

  useLayoutEffect(() => layout(current), [current, layout]);

  /** User-driven moves are announced to screen readers; autoplay is not. */
  const go = useCallback(
    (index: number) => {
      const next = ((index % total) + total) % total;
      setCurrent(next);
      setAnnouncement(`${projects[next].name}, ${next + 1} of ${total}`);
    },
    [projects, total],
  );

  useEffect(() => {
    if (reduced || paused || !inView) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setCurrent((index) => (index + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [reduced, paused, inView, total, current]);

  // Drag or swipe: the cards follow the pointer, then settle on the nearest store.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = { startX: event.clientX, active: true, moved: false, offset: 0 };
    const step = (cards.current[0]?.offsetWidth ?? 320) * SPACING;

    const onMove = (move: globalThis.PointerEvent) => {
      const dx = move.clientX - drag.current.startX;
      if (!drag.current.moved && Math.abs(dx) > 6) {
        drag.current.moved = true;
        region.current?.setAttribute("data-dragging", "true");
      }
      if (drag.current.moved) {
        drag.current.offset = dx / step;
        layout(current, drag.current.offset);
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      drag.current.active = false;
      region.current?.setAttribute("data-dragging", "false");
      if (drag.current.moved) {
        const steps = Math.round(-drag.current.offset);
        if (steps === 0) layout(current);
        else go(current + steps);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // A drag never counts as a click; a side card comes to the front instead of opening.
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
      return;
    }
    const card = (event.target as Element).closest<HTMLElement>("[data-slide]");
    const index = card ? Number(card.dataset.slide) : current;
    if (index !== current) {
      event.preventDefault();
      go(index);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") go(current - 1);
    else if (event.key === "ArrowRight") go(current + 1);
    else return;
    event.preventDefault();
  };

  // The stage springs up the first time the slider scrolls into view.
  const [stage, animate] = useAnimate<HTMLDivElement>();
  const stageSeen = useInView(stage, { once: true, amount: 0.25 });
  useRevealOnce(stageSeen, () =>
    animate(
      stage.current,
      reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0.8, 1], y: [80, 0] },
      reduced ? { duration: 0.4 } : { type: "spring", stiffness: 120, damping: 18, opacity: { duration: 0.4 } },
    ),
  );

  return (
    <>
      <div
        ref={region}
        role="region"
        aria-roledescription="carousel"
        aria-label={copy.sliderLabel}
        tabIndex={0}
        data-cursor="Drag"
        className={styles.slider}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div ref={stage} data-pop="" className={styles.stage}>
          {projects.map((project, index) => {
            const domain = domainOf(project.url);
            const [from, to] = storeGradient(project.name);
            const active = index === current;
            return (
              <a
                key={project.url}
                ref={(node) => {
                  cards.current[index] = node;
                }}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                data-slide={index}
                data-active={active}
                tabIndex={active ? 0 : -1}
                aria-label={`${project.name}, opens ${domain} in a new tab`}
                className={`glass ${styles.card}`}
                // Server render shows the first store in front; the browser takes over from here.
                style={placement(offsetOf(index, 0, total)) as CSSProperties}
              >
                <div className={styles.mock} aria-hidden="true">
                  <BrowserBar url={domain} compact />
                  <div className={styles.screen}>
                    {project.image ? (
                      <Image src={project.image} alt="" fill sizes="320px" className="object-cover object-top" />
                    ) : (
                      <div className={styles.page}>
                        <div className={styles.pageHero} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                          {project.name}
                        </div>
                        <div className={styles.pageRow}>
                          <i />
                          <i />
                          <i />
                        </div>
                        <div className={styles.pageStrip} />
                        <div className={styles.pageRow}>
                          <i />
                          <i />
                          <i />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.info}>
                  <div>
                    <b>{project.name}</b>
                    <small>{domain}</small>
                  </div>
                  <span className={styles.go} aria-hidden="true">
                    <Icon name="arrowUpRight" size={18} strokeWidth={2.4} />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="wrap mt-2.5 flex items-center gap-4">
        <button
          type="button"
          aria-label={copy.previous}
          onClick={() => go(current - 1)}
          className="grid size-13 flex-none place-items-center rounded-full border border-glass-border bg-glass text-fg backdrop-blur-md transition-[background-color,color,scale] duration-300 hover:bg-lime hover:text-on-lime active:scale-90"
        >
          <Icon name="chevronLeft" size={20} strokeWidth={2.4} />
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-sm bg-line" aria-hidden="true">
          <i
            className="block h-full origin-left bg-lime transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ transform: `scaleX(${(current + 1) / total})` }}
          />
        </div>
        <span className="min-w-[4.5em] text-center font-display font-extrabold tabular-nums" aria-hidden="true">
          {String(current + 1).padStart(2, "0")} / {total}
        </span>
        <button
          type="button"
          aria-label={copy.next}
          onClick={() => go(current + 1)}
          className="grid size-13 flex-none place-items-center rounded-full border border-glass-border bg-glass text-fg backdrop-blur-md transition-[background-color,color,scale] duration-300 hover:bg-lime hover:text-on-lime active:scale-90"
        >
          <Icon name="chevronRight" size={20} strokeWidth={2.4} />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
