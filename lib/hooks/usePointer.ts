"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * `fine` is true for a mouse or trackpad that can hover. Pointer-driven effects
 * (magnetic buttons, tilt, parallax) only run then. Always false on the server.
 */
export function usePointer() {
  const fine = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  return { fine };
}
