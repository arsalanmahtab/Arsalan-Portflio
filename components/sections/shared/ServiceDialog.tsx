"use client";

import { animate, stagger } from "motion/react";
import { useEffectEvent, useId, useLayoutEffect, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { lobbyCopy, type LobbyService } from "@/data/lobbyServices";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Icon } from "@/components/ui/Icon";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

const copy = lobbyCopy.dialog;

/** Expo out and expo in, as in the prototype. */
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const EXPO_IN = [0.7, 0, 0.84, 0] as const;
const PANEL_RADIUS = 28;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

type Props = {
  /** The service to show; null keeps the dialog closed. */
  service: LobbyService | null;
  /** The card it opens from: the panel grows out of it and shrinks back into it. */
  origin: HTMLElement | null;
  /** Called once the close animation has finished. */
  onClosed: () => void;
};

/**
 * A service's details in a large glass dialog that expands from its card.
 * Closes with the × button, "Back to reception", Esc or a click on the
 * backdrop. While open the page behind is inert and doesn't scroll.
 */
export function ServiceDialog({ service, origin, onClosed }: Props) {
  if (!service) return null;
  // A custom modal rather than <dialog>: the top layer would cover the custom cursor.
  return createPortal(<Panel service={service} origin={origin} onClosed={onClosed} />, document.body);
}

function Panel({ service, origin, onClosed }: { service: LobbyService; origin: HTMLElement | null; onClosed: () => void }) {
  const layer = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const scroll = useSmoothScroll();
  const reduced = useReducedMotionSoft();
  const titleId = useId();
  const descriptionId = useId();
  const closing = useRef(false);
  const opening = useRef<{ stop: () => void }[]>([]);
  const release = useRef<() => void>(() => {});

  /** Move the panel between the card's box (progress 0) and its own (progress 1). */
  const morph = (progress: number, opacity: number) => {
    const box = panel.current;
    if (!box || !origin) return;
    const from = origin.getBoundingClientRect();
    // offset* ignore the transform being animated, so this is always the resting box.
    const to = { left: box.offsetLeft, top: box.offsetTop, width: box.offsetWidth, height: box.offsetHeight };
    const scaleX = mix(from.width / to.width, 1, progress);
    const scaleY = mix(from.height / to.height, 1, progress);
    const x = mix(from.left + from.width / 2 - (to.left + to.width / 2), 0, progress);
    const y = mix(from.top + from.height / 2 - (to.top + to.height / 2), 0, progress);
    const radius = mix(parseFloat(getComputedStyle(origin).borderTopLeftRadius) || 18, PANEL_RADIUS, progress);
    box.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
    // Counter the scale so the corners stay round while the panel stretches.
    box.style.borderRadius = `${radius / scaleX}px / ${radius / scaleY}px`;
    box.style.opacity = String(opacity);
  };

  const canMorph = () => !reduced && origin !== null && origin.getClientRects().length > 0;

  /** Animate out, give the page back, then hand focus to the card or the contact section. */
  const close = async (thenGoTo?: string) => {
    const box = panel.current;
    if (closing.current || !box) return;
    closing.current = true;
    opening.current.forEach((animation) => animation.stop());

    animate(backdrop.current!, { opacity: 0 }, { duration: 0.3 });
    if (!thenGoTo && canMorph()) {
      await animate(1, 0, { duration: 0.4, ease: EXPO_IN, onUpdate: (p) => morph(p, p) });
    } else {
      await animate(box, { opacity: 0 }, { duration: 0.2 });
    }

    release.current();
    if (!thenGoTo || !scroll.goTo(thenGoTo)) origin?.focus({ preventScroll: true });
    onClosed();
  };

  const onStart = (event: MouseEvent) => {
    event.preventDefault();
    close("contact");
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !panel.current) return;
    // Keep Tab inside the dialog.
    const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  /** Lock the page behind, grow out of the card, stagger the contents in. Returns the cleanup. */
  const open = useEffectEvent(() => {
    const box = panel.current;
    const host = layer.current;
    if (!box || !host) return;

    scroll.stop();
    const madeInert = Array.from(document.body.children).filter(
      (child): child is HTMLElement => child !== host && child instanceof HTMLElement && !child.inert,
    );
    madeInert.forEach((child) => (child.inert = true));
    let released = false;
    release.current = () => {
      if (released) return;
      released = true;
      madeInert.forEach((child) => (child.inert = false));
      scroll.start();
    };

    const items = box.querySelectorAll<HTMLElement>("[data-dialog-item]");
    items.forEach((item) => (item.style.opacity = "0"));
    animate(backdrop.current!, { opacity: [0, 1] }, { duration: 0.3 });

    if (canMorph()) {
      morph(0, 0.5); // before the first paint, so the full-size panel never flashes
      const grow = animate(0, 1, { duration: 0.65, ease: EXPO_OUT, onUpdate: (p) => morph(p, mix(0.5, 1, p)) });
      grow.then(() => {
        if (closing.current) return;
        box.style.transform = "";
        box.style.borderRadius = "";
      });
      opening.current = [
        grow,
        animate(items, { opacity: [0, 1], y: [24, 0] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: stagger(0.05, { startDelay: 0.2 }) }),
      ];
    } else {
      box.style.opacity = "0";
      opening.current = [
        animate(box, { opacity: [0, 1] }, { duration: 0.25 }),
        animate(items, { opacity: [0, 1] }, { duration: 0.25, delay: stagger(0.03, { startDelay: 0.1 }) }),
      ];
    }

    closeButton.current?.focus({ preventScroll: true });
    const listener = (event: KeyboardEvent) => onKeyDown(event);
    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
      opening.current.forEach((animation) => animation.stop());
      release.current();
    };
  });

  // The panel mounts once per opening, so this runs once per opening.
  useLayoutEffect(() => open(), []);

  return (
    <div ref={layer} className="fixed inset-0 z-80 grid place-items-center p-4">
      <div
        ref={backdrop}
        aria-hidden="true"
        className="absolute inset-0 bg-[rgb(8_6_20/0.55)] backdrop-blur-[6px]"
        onClick={() => close()}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-lenis-prevent=""
        className="glass relative max-h-[calc(100dvh-2rem)] w-full max-w-140 overflow-y-auto overscroll-contain rounded-[28px] px-7 pt-8 pb-6.5 outline-none max-[480px]:px-5.5"
        style={{ backgroundColor: "color-mix(in srgb, var(--card) 72%, transparent)" }}
      >
        <button
          ref={closeButton}
          type="button"
          aria-label={copy.close}
          onClick={() => close()}
          className="absolute top-4 right-4 z-2 grid size-11 place-items-center rounded-full border border-glass-border transition-colors duration-300 hover:bg-lime hover:text-on-lime"
        >
          <Icon name="close" size={18} strokeWidth={2.4} />
        </button>

        <div data-dialog-item="">
          <span className="grid size-14.5 place-items-center rounded-[17px] bg-lime text-on-lime shadow-[0_10px_30px_-10px_var(--lime)]">
            <Icon name={service.icon} size={28} />
          </span>
        </div>
        <h2 id={titleId} data-dialog-item="" className="mt-4.5 mb-2.5 text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.05] font-bold">
          {service.title}
        </h2>
        <p id={descriptionId} data-dialog-item="" className="mb-4.5 text-fg-2">
          {service.description}
        </p>
        <ul aria-label={copy.included} className="mb-6 grid list-none grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2.5 p-0">
          {service.included.map((item) => (
            <li key={item} data-dialog-item="" className="flex items-center gap-2.5 font-semibold">
              <Icon name="check" size={16} strokeWidth={3} className="flex-none text-lime-text" />
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2.5">
          <div data-dialog-item="">
            <AnimatedButton variant="primary" href="#contact" onClick={onStart}>
              {copy.start}
            </AnimatedButton>
          </div>
          <div data-dialog-item="">
            <AnimatedButton onClick={() => close()}>{copy.back}</AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
