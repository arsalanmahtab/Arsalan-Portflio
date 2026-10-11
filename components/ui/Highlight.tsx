"use client";

import clsx from "clsx";
import { useAnimate } from "motion/react";
import type { ReactNode } from "react";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the wipe starts. */
  delay?: number;
  /** Play on cue instead of on scroll, e.g. after the hero intro. */
  play?: boolean;
};

/**
 * The lime highlight box: lime background, black bold text. The background
 * wipes in from the left, then the text springs up.
 */
export function Highlight({ children, className, delay = 0, play }: Props) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const inView = useInViewOnce(scope, { amount: 0.6 });
  const reduced = useReducedMotionSoft();

  useRevealOnce(play ?? inView, () =>
    Promise.all([
      animate(
        "[data-highlight-bg]",
        { scaleX: [0, 1] },
        { duration: reduced ? 0.3 : 0.9, ease: [0.16, 1, 0.3, 1], delay },
      ),
      animate(
        "[data-highlight-text]",
        reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [14, 0] },
        reduced
          ? { duration: 0.3, delay }
          : { delay: delay + 0.4, y: { type: "spring", stiffness: 320, damping: 16 }, opacity: { duration: 0.3 } },
      ),
    ]),
  );

  return (
    <span
      ref={scope}
      className={clsx("relative inline-block px-[0.22em] py-[0.04em] font-extrabold text-on-lime", className)}
    >
      <span data-highlight-bg="" aria-hidden="true" className="absolute inset-0 origin-left bg-lime" />
      <span data-highlight-text="" className="relative inline-block">
        {children}
      </span>
    </span>
  );
}
