"use client";

import { useInView, type UseInViewOptions } from "motion/react";
import { useEffect, useEffectEvent, useRef, type RefObject } from "react";

type Options = {
  /** Fraction of the element that must be visible, 0 to 1. */
  amount?: UseInViewOptions["amount"];
  /** Grow or shrink the viewport, e.g. "0px 0px -15% 0px" to trigger a little later. */
  margin?: UseInViewOptions["margin"];
};

/** Anything that can say when it's finished: a Promise or Motion's animation controls. */
type Thenable = { then: (onResolve: () => void) => unknown };

/** True from the first time the element scrolls into view. */
export function useInViewOnce(ref: RefObject<Element | null>, { amount = 0.3, margin }: Options = {}) {
  return useInView(ref, { once: true, amount, margin });
}

/**
 * Runs `reveal` once when `active` turns true. If Next.js hides the page
 * mid-animation (it keeps visited routes mounted but hidden), the reveal plays
 * again when the page comes back instead of staying half finished.
 */
export function useRevealOnce(active: boolean, reveal: () => Thenable | void) {
  const state = useRef<"idle" | "running" | "done">("idle");
  const run = useEffectEvent(reveal);

  useEffect(() => {
    if (!active || state.current === "done") return;
    state.current = "running";
    let cancelled = false;
    const finish = () => {
      if (!cancelled) state.current = "done";
    };
    const animation = run();
    if (animation) animation.then(finish);
    else finish();
    return () => {
      cancelled = true;
      if (state.current === "running") state.current = "idle";
    };
  }, [active]);
}
