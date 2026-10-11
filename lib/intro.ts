"use client";

import { useSyncExternalStore } from "react";

/*
 * When the page's entrance animations may start: as soon as the first-visit
 * loader begins to wipe away, or straight after hydration when there is no
 * loader. The loader marks it; hero intros wait for it.
 */

let ready = false;
const listeners = new Set<() => void>();

export function markIntroReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** False on the server and until the loader (if any) starts to leave. */
export function useIntroReady() {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}
