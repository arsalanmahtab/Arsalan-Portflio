"use client";

import { useRef } from "react";
import { site } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./Signature.module.css";

/** Giant outlined "Arslan Mahtab" that fills with lime as you scroll to the end of the page. */
export function Signature() {
  const signature = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      signature.current,
      { "--fill": "0%" },
      {
        "--fill": "100%",
        ease: "none",
        scrollTrigger: {
          trigger: signature.current,
          start: "top 95%",
          // The page ends before the name reaches 45%, so finish at the very bottom instead.
          end: "clamp(bottom 45%)",
          scrub: 1,
        },
      },
    );
  });

  return (
    <div className={styles.frame}>
      <p ref={signature} aria-hidden="true" className={styles.signature}>
        {site.name}
      </p>
    </div>
  );
}
