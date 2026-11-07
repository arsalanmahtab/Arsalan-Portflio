"use client";

import { useSyncExternalStore } from "react";

/*
 * Whether the footer robot is on screen right now. The footer robot sets it;
 * the Bago mascot reads it and steps aside while the robot is visiting.
 */

let visible = false;
const listeners = new Set<() => void>();

export function setFooterRobotVisible(next: boolean) {
  if (visible === next) return;
  visible = next;
  listeners.forEach((listener) => listener());
}

export function useFooterRobotVisible() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => visible,
    () => false,
  );
}
