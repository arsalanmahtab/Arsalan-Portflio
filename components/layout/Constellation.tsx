"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { createConstellation, type Constellation as Field } from "@/lib/constellation";

/**
 * Faint drifting dots and thin lines behind the whole site (lib/constellation.ts).
 * The work map's own moments are the map section and the chapter openers.
 */
export function Constellation() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<Field | null>(null);
  const reduced = useReducedMotionSoft();

  useEffect(() => {
    if (!canvas.current) return;
    const created = createConstellation(canvas.current);
    field.current = created;
    return () => {
      created?.destroy();
      field.current = null;
    };
  }, []);

  useEffect(() => {
    field.current?.setReduced(reduced);
  }, [reduced]);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-1 size-full" />;
}
