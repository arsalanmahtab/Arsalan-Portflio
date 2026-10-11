"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * True when the visitor asks for reduced motion.
 *
 * The site softens motion rather than removing it (PROMPT.md section 14):
 * no smooth scroll, parallax, mouse tilt or marquee skew, shorter durations and
 * simple fades, while characters keep their gentle idle loops.
 * Always false during server rendering.
 */
export function useReducedMotionSoft() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
