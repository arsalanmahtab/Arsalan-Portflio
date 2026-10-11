"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** A 2px violet-to-lime line along the top edge that fills as the page scrolls. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!bar.current) return;
    const setScale = gsap.quickSetter(bar.current, "scaleX");
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScale(self.progress),
      onRefresh: (self) => setScale(self.progress),
    });
  });

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-[env(safe-area-inset-top,0px)] z-70 h-0.5 origin-left bg-linear-to-r from-violet to-lime"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
