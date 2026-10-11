"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Cursor.module.css";

const INTERACTIVE = "a[href], button, [role='button'], summary, label, input, select, textarea";

type CursorState = "idle" | "grow" | "label";

/**
 * Dot + trailing ring cursor for mouse users. The dot grows over links and buttons;
 * over an element with data-cursor="Word" the ring fills lime and shows the word.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!dot.current || !ring.current || !label.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dotEl = dot.current;
    const ringEl = ring.current;
    const labelEl = label.current;
    const setDotX = gsap.quickSetter(dotEl, "x", "px");
    const setDotY = gsap.quickSetter(dotEl, "y", "px");
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.6, ease: "power3" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.6, ease: "power3" });

    let x = -100;
    let y = -100;
    let visible = false;
    let frame = 0;

    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      dotEl.dataset.visible = ringEl.dataset.visible = String(next);
    };

    const setState = (state: CursorState) => {
      dotEl.dataset.state = ringEl.dataset.state = state;
    };

    const inspect = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const labelled = element?.closest<HTMLElement>("[data-cursor]");
      if (labelled?.dataset.cursor) {
        labelEl.textContent = labelled.dataset.cursor;
        setState("label");
      } else {
        setState(element?.closest(INTERACTIVE) ? "grow" : "idle");
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      setDotX(x);
      setDotY(y);
      if (!visible) {
        gsap.set(ringEl, { x, y });
        setVisible(true);
      }
      ringX(x);
      ringY(y);
    };

    const onOver = (event: PointerEvent) => inspect(event.target);
    const onLeave = () => setVisible(false);
    // Content moves under a still mouse while scrolling, so re-check what it's over.
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => inspect(document.elementFromPoint(x, y)));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  });

  return (
    <>
      <div ref={ring} aria-hidden="true" className={styles.ring}>
        <span className={styles.ringCircle} />
        <b ref={label} className={styles.ringLabel} />
      </div>
      <div ref={dot} aria-hidden="true" className={styles.dot}>
        <span className={styles.dotCore} />
      </div>
    </>
  );
}
