"use client";

import { animate, stagger, useAnimate } from "motion/react";
import { useEffect, useRef } from "react";
import { saasSection } from "@/data/software";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./SaasLaunch.module.css";

const copy = saasSection.dashboard;
type Kpi = (typeof copy.kpis)[number];

const format = (kpi: Kpi, value: number) =>
  `${"prefix" in kpi ? kpi.prefix : ""}${
    "decimals" in kpi ? value.toFixed(kpi.decimals) : Math.round(value).toLocaleString("en-US")
  }${"suffix" in kpi ? kpi.suffix : ""}`;

/**
 * An example SaaS dashboard: sidebar, three KPI tiles that count up and seven
 * bars that grow, the first time it is 30% in view. The server HTML shows the
 * final numbers.
 */
export function Dashboard() {
  const [scope, animateIn] = useAnimate<HTMLDivElement>();
  const numbers = useRef<(HTMLElement | null)[]>([]);
  const inView = useInViewOnce(scope, { amount: 0.3 });
  const reduced = useReducedMotionSoft();
  const counted = useRef(false);

  // Start the counters from zero, unless they have already counted up.
  useEffect(() => {
    if (counted.current) return;
    numbers.current.forEach((element, index) => {
      if (element) element.textContent = format(copy.kpis[index], 0);
    });
  }, []);

  useRevealOnce(inView, () => {
    counted.current = true;
    const counts = copy.kpis.map((kpi, index) =>
      animate(0, kpi.value, {
        duration: reduced ? 0.6 : 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (value) => {
          const element = numbers.current[index];
          if (element) element.textContent = format(kpi, value);
        },
      }),
    );
    const bars = animateIn(
      "[data-bar]",
      { scaleY: [0, 1] },
      reduced
        ? { duration: 0.4, delay: stagger(0.04) }
        : { duration: 1, ease: [0.2, 0.9, 0.3, 1.2], delay: stagger(0.08) },
    );
    return Promise.all([...counts, bars]);
  });

  return (
    <div ref={scope} role="img" aria-label={copy.label} className="glass flex min-h-82.5 rounded-3xl">
      <div className="flex w-14.5 flex-none flex-col items-center gap-3.5 border-r border-glass-border py-5 max-[480px]:w-11">
        {[0, 1, 2, 3].map((item) => (
          <i key={item} className={`size-5.5 rounded-[7px] ${item === 0 ? "bg-lime" : "bg-fg/12"}`} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4.5 p-5 max-[480px]:p-3.5">
        <div className="grid grid-cols-3 gap-2.5 max-[480px]:gap-1.5">
          {copy.kpis.map((kpi, index) => (
            <div key={kpi.label} className="rounded-[14px] bg-fg/5 p-3 max-[480px]:px-2">
              <small className="block font-semibold text-fg-2">{kpi.label}</small>
              <b
                ref={(element) => {
                  numbers.current[index] = element;
                }}
                className="font-display text-[clamp(0.9rem,2.2vw,1.5rem)] whitespace-nowrap tabular-nums"
              >
                {format(kpi, kpi.value)}
              </b>
            </div>
          ))}
        </div>
        <div className="flex min-h-35 flex-1 items-end gap-2.5">
          {copy.bars.map((height, index) => (
            <i key={index} data-bar="" className={styles.bar} style={{ height: `${height}%` }} />
          ))}
        </div>
        <p className="m-0 text-[0.85rem] text-fg-2">{copy.note}</p>
      </div>
    </div>
  );
}
