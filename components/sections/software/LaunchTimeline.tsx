"use client";

import { useRef } from "react";
import { saasSection } from "@/data/software";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./SaasLaunch.module.css";

/** Where on screen the line's tip sits while you scroll: 65% of the way down. */
const TIP = "65%";

/**
 * Plan → Design → Build → Launch → Scale. The lime line draws down the list
 * with the scroll (its tip stays at the same height on screen) and each step's
 * dot lights up as the line reaches it. With reduced motion it is simply drawn.
 */
export function LaunchTimeline() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSoft();

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(
        q("[data-fill]"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: `top ${TIP}`, end: `bottom ${TIP}`, scrub: true } },
      );
      (q("li") as HTMLElement[]).forEach((step) =>
        ScrollTrigger.create({
          trigger: step,
          start: `top+=12 ${TIP}`,
          onEnter: () => step.toggleAttribute("data-reached", true),
          onLeaveBack: () => step.toggleAttribute("data-reached", false),
        }),
      );
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div ref={root} className="relative">
      <span aria-hidden="true" className={styles.track} />
      <span aria-hidden="true" data-fill="" className={styles.fill} />
      <ol className={styles.timeline}>
        {saasSection.steps.map((step) => (
          <li key={step.title} className={styles.step}>
            <b className="block text-[1.1rem]">{step.title}</b>
            <span className="text-fg-2">{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
