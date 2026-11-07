import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils } from "three";

/*
 * Small helpers shared by the 3D characters.
 */

/**
 * Ease `current` toward `target`, frame-rate independent. `perFrame` is the
 * share of the gap closed each frame at 60fps (0.05 = slow, 0.3 = snappy).
 */
export function approach(current: number, target: number, perFrame: number, delta: number) {
  return MathUtils.damp(current, target, -Math.log(1 - perFrame) * 60, delta);
}

/** A repeatable pseudo-random sequence (mulberry32), so star fields render the same every time. */
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

/** `count` points spread through a box of the given size, centred on the origin. */
export function scatter(count: number, size: [number, number, number], seed: number) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * size[0];
    positions[i * 3 + 1] = (random() - 0.5) * size[1];
    positions[i * 3 + 2] = (random() - 0.5) * size[2];
  }
  return positions;
}

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number) => x * x * x;

/**
 * Render only while `active` (on screen, tab visible). Also stops rendering the
 * moment this scene's effects are torn down, e.g. when Next.js hides the page.
 */
export function useRenderWhile(active: boolean) {
  const setFrameloop = useThree((state) => state.setFrameloop);
  useEffect(() => {
    setFrameloop(active ? "always" : "never");
    return () => setFrameloop("never");
  }, [active, setFrameloop]);
}

/**
 * The pointer across the whole window, from -0.5 to 0.5 on each axis (0, 0
 * until it moves). Read `.current` inside useFrame.
 */
export function useWindowPointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}
