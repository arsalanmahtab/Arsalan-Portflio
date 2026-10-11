"use client";

import clsx from "clsx";
import { useAnimate } from "motion/react";
import type { ReactNode } from "react";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Small glass label above a section heading, with a pulsing status dot. Pops in when scrolled to. */
export function Pill({ children, className }: Props) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const inView = useInViewOnce(scope, { amount: 0, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotionSoft();

  useRevealOnce(inView, () =>
    animate(
      scope.current,
      reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0.6, 1] },
      reduced
        ? { duration: 0.3 }
        : { scale: { type: "spring", stiffness: 400, damping: 14 }, opacity: { duration: 0.3 } },
    ),
  );

  return (
    <span
      ref={scope}
      data-pop=""
      className={clsx(
        "glass glass-sheen mb-5.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.88rem] font-bold",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative size-2 shrink-0 rounded-full bg-mint before:absolute before:inset-0 before:animate-pulse-ring before:rounded-full before:bg-mint"
      />
      {children}
    </span>
  );
}
