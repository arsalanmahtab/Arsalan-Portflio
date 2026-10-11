"use client";

import { animate as animateValue, stagger, useAnimate } from "motion/react";
import { useRef } from "react";
import { projects } from "@/data/projects";
import { storesSection as copy } from "@/data/shopify";
import { StoreSlider } from "@/components/sections/shopify/StoreSlider";
import { Marquee } from "@/components/ui/Marquee";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { leadClass } from "@/lib/styles";

const nameRow = "font-display text-[clamp(1.5rem,3.2vw,2.5rem)] font-extrabold tracking-[-0.03em]";
const names = projects.map((project) => project.name);

/**
 * "32+ stores designed and built." The count climbs as the heading rises in,
 * two rows of store names drift past, and the coverflow shows every store.
 */
export function AllStores() {
  const [heading, animate] = useAnimate<HTMLHeadingElement>();
  const count = useRef<HTMLSpanElement>(null);
  const inView = useInViewOnce(heading, { amount: 0.4 });
  const reduced = useReducedMotionSoft();

  useRevealOnce(inView, () => {
    const counter = animateValue(0, projects.length, {
      duration: reduced ? 0.6 : 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        if (count.current) count.current.textContent = String(Math.round(value));
      },
    });
    const lines = animate(
      "[data-reveal]",
      reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [50, 0] },
      { duration: reduced ? 0.4 : 0.8, ease: [0.16, 1, 0.3, 1], delay: stagger(0.12) },
    );
    return Promise.all([counter, lines]);
  });

  return (
    <section id="stores" className="border-t border-line py-[clamp(80px,11vw,150px)]">
      <div className="wrap">
        <h2
          ref={heading}
          className="mb-5.5 text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.98] font-extrabold tracking-[-0.045em]"
        >
          <span data-reveal="" className="block">
            {/* Reserves the final number's width so the count-up never pushes the text. */}
            <span
              ref={count}
              className="inline-block text-right text-lime-text tabular-nums"
              style={{ minWidth: `${String(projects.length).length}ch` }}
            >
              {projects.length}
            </span>
            {copy.countSuffix}
          </span>
          <span data-reveal="" className="block">
            {" "}
            <span className="serif-accent">{copy.accent}</span>
          </span>
        </h2>
        <p className={leadClass}>{copy.lead}</p>
      </div>

      <div aria-hidden="true" className="grid gap-1.5 overflow-hidden pt-2.5 pb-11">
        <Marquee items={names} duration={70} gap={28} pauseOnHover decorative className={nameRow} />
        <Marquee items={[...names].reverse()} duration={80} gap={28} reverse outline pauseOnHover decorative className={nameRow} />
      </div>

      <StoreSlider projects={projects} />
    </section>
  );
}
