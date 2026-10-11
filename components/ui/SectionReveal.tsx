"use client";

import { stagger, useAnimate } from "motion/react";
import { createElement, type ReactNode } from "react";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

type Props = {
  as?: "div" | "section" | "ul" | "ol" | "header";
  children: ReactNode;
  className?: string;
  id?: string;
  /** Seconds between each child. */
  stagger?: number;
  /** Seconds before the first child starts. */
  delay?: number;
  /** How far children rise, in px. */
  distance?: number;
  /** Fraction of the group that must be visible to start. */
  amount?: number;
};

/**
 * Fades and lifts its direct children into place, one after another, the
 * first time the group scrolls into view. With reduced motion it is a plain fade.
 */
export function SectionReveal({
  as = "div",
  children,
  className,
  id,
  stagger: gap = 0.08,
  delay = 0,
  distance = 50,
  amount = 0.15,
}: Props) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const inView = useInViewOnce(scope, { amount });
  const reduced = useReducedMotionSoft();

  useRevealOnce(inView, () => {
    const items = Array.from(scope.current.children);
    if (items.length === 0) return;
    return animate(
      items,
      reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [distance, 0] },
      {
        duration: reduced ? 0.4 : 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: stagger(reduced ? gap / 2 : gap, { startDelay: delay }),
      },
    );
  });

  return createElement(as, { ref: scope, className, id, "data-reveal-group": "" }, children);
}
