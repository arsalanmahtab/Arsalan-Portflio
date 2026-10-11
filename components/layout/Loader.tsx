"use client";

import { useRef } from "react";
import { modes } from "@/config/modes";
import { useModeTransition } from "@/components/providers/ModeTransition";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { markIntroReady } from "@/lib/intro";
import { gsap, useGSAP } from "@/lib/gsap";
import { LOADER_SEEN_KEY } from "@/lib/loaderGate";
import styles from "./Loader.module.css";

/**
 * Violet panel with a counter from 0 to 100 over 1.5s, then a wipe up.
 * The page intro starts as the panel begins to leave.
 */
export function Loader() {
  const panel = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const { currentMode } = useModeTransition();
  const { stop, start } = useSmoothScroll();

  useGSAP(() => {
    const html = document.documentElement;
    if (!window.__amLoader || !panel.current) {
      markIntroReady();
      return;
    }
    // React's development remount clears attributes it doesn't own on <html>; put it back.
    html.setAttribute("data-loader", "");
    stop();

    const progress = { value: 0 };
    const finish = () => {
      window.__amLoader = false;
      html.removeAttribute("data-loader");
      start();
      try {
        localStorage.setItem(LOADER_SEEN_KEY, "1");
      } catch {}
    };

    gsap
      .timeline()
      .to(progress, {
        value: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(progress.value));
        },
      })
      .call(markIntroReady)
      .to(panel.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut", onComplete: finish });
  });

  return (
    <div ref={panel} aria-hidden="true" className={styles.loader}>
      <span ref={count} className={styles.count}>
        0
      </span>
      <span className={styles.text}>{modes[currentMode].loaderText}</span>
    </div>
  );
}
