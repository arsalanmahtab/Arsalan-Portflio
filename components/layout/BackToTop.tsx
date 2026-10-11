"use client";

import { useId } from "react";
import { contactLabels } from "@/data/contact";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import styles from "./BackToTop.module.css";

/** Spinning "BACK TO TOP ·" badge around a lime arrow; scrolls to the top through Lenis. */
export function BackToTop() {
  const { scrollTo } = useSmoothScroll();
  const pathId = useId();

  const goToTop = () => {
    scrollTo(0, { duration: 1.6 });
    // Keyboard users continue from the top of the content.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button type="button" className={styles.button} aria-label={contactLabels.backToTop} onClick={goToTop}>
      <span className={styles.spin} aria-hidden="true">
        <span className={styles.boost}>
          <svg className={styles.ring} viewBox="0 0 120 120">
            <defs>
              <path id={pathId} d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
            </defs>
            <text>
              <textPath href={`#${pathId}`}>{contactLabels.backToTopRing}</textPath>
            </text>
          </svg>
        </span>
      </span>
      <span className={styles.arrow} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}
