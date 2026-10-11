"use client";

import clsx from "clsx";
import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./Marquee.module.css";

type Props = {
  items: readonly string[];
  /** Move left to right instead of right to left. */
  reverse?: boolean;
  /** Outlined letters instead of filled. */
  outline?: boolean;
  /** Seconds for one full loop. */
  duration?: number;
  /** Pause while the pointer is over the row. */
  pauseOnHover?: boolean;
  /** Lean into the scroll direction in proportion to scroll speed. */
  skew?: boolean;
  /** Text size and font classes. */
  className?: string;
  /** Hide the whole row from screen readers when it only repeats nearby content. */
  decorative?: boolean;
};

/**
 * Endless text row (CSS animation). The first copy of the items is a real list;
 * the copy that makes the loop seamless is hidden from screen readers.
 * With `skew`, GSAP leans the row by scroll velocity (off for reduced motion).
 */
export function Marquee({
  items,
  reverse = false,
  outline = false,
  duration = 28,
  pauseOnHover = false,
  skew = false,
  className,
  decorative = false,
}: Props) {
  const row = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSoft();

  useGSAP(
    () => {
      if (!skew || reduced || !row.current) return;
      const skewTo = gsap.quickTo(row.current, "skewX", { duration: 0.4, ease: "power3" });
      let settle = 0;
      ScrollTrigger.create({
        trigger: row.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          skewTo(gsap.utils.clamp(-14, 14, self.getVelocity() / -250));
          window.clearTimeout(settle);
          settle = window.setTimeout(() => skewTo(0), 120);
        },
      });
      return () => window.clearTimeout(settle);
    },
    { dependencies: [skew, reduced], revertOnUpdate: true },
  );

  const group = (hidden: boolean) => (
    <ul className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className={styles.item}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={row}
      aria-hidden={decorative || undefined}
      className={clsx(styles.row, outline && styles.outline, pauseOnHover && styles.pausable, className)}
    >
      <div
        className={clsx(styles.track, reverse && styles.reverse)}
        style={{ "--duration": `${duration}s` } as CSSProperties}
      >
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
