"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ModeTransition } from "@/components/providers/ModeTransition";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

/**
 * App-wide client providers. MotionConfig turns Motion's transform and layout
 * animations into plain fades for visitors who prefer reduced motion.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <ModeTransition>{children}</ModeTransition>
      </SmoothScroll>
    </MotionConfig>
  );
}
