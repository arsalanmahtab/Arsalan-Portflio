"use client";

import clsx from "clsx";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { webSection } from "@/data/shopify";
import { Icon } from "@/components/ui/Icon";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./MigrationDemo.module.css";

const copy = webSection.migration;
const HOLD_MS = 1400;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A store migrates to Shopify on a loop: the source platform flips, packets flow
 * down the pipe, the progress bar fills and each kind of data is ticked off.
 */
export function MigrationDemo() {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const reduced = useReducedMotionSoft();
  const [platform, setPlatform] = useState(0);
  const [ticked, setTicked] = useState(0);
  const progress = useMotionValue(0);
  const percent = useTransform(progress, (value) => `${Math.round(value * 100)}%`);

  useMotionValueEvent(progress, "change", (value) => {
    const done = Math.min(copy.checklist.length, Math.floor(value * copy.checklist.length + 0.001));
    setTicked((current) => (current === done ? current : done));
  });

  // Fill, hold, move on to the next platform; only while the demo is on screen.
  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let fill: ReturnType<typeof animate> | undefined;
    (async () => {
      while (!cancelled) {
        progress.set(0);
        fill = animate(progress, 1, { duration: reduced ? 3 : 4, ease: "easeInOut" });
        await fill;
        if (cancelled) return;
        await wait(HOLD_MS);
        if (cancelled) return;
        setPlatform((index) => (index + 1) % copy.platforms.length);
      }
    })();
    return () => {
      cancelled = true;
      fill?.stop();
    };
  }, [inView, reduced, progress]);

  const complete = ticked === copy.checklist.length;

  return (
    <div
      ref={root}
      role="img"
      aria-label={copy.label}
      className="glass grid items-center gap-8 rounded-3xl p-6 min-[760px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[760px]:p-8"
    >
      <div className="mx-auto flex w-full max-w-65 flex-col items-center">
        <div className="w-full rounded-2xl bg-fg/6 px-5.5 py-4 text-center">
          <small className="block font-bold text-fg-2">{copy.from}</small>
          <span className="relative block h-9 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.b
                key={platform}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -28, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="block font-display text-[1.4rem] leading-9 whitespace-nowrap"
              >
                {copy.platforms[platform]}
              </motion.b>
            </AnimatePresence>
          </span>
        </div>

        <div className={styles.pipe} data-active={inView}>
          {copy.packets.map((packet, index) => (
            <span key={packet} className={styles.packet} style={{ "--delay": `${index * -0.8}s` } as CSSProperties}>
              {packet}
            </span>
          ))}
        </div>

        <div
          className={clsx(
            "w-full rounded-2xl bg-lime/16 px-5.5 py-4 text-center transition-shadow duration-500",
            complete ? "shadow-[0_0_44px_-6px_var(--lime)]" : "shadow-[0_0_24px_-12px_var(--lime)]",
          )}
        >
          <small className="block font-bold text-fg-2">{copy.to}</small>
          <b className="block font-display text-[1.4rem] leading-9 text-lime-text">{copy.destination}</b>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between font-bold">
          <span>{complete ? copy.done : copy.progress}</span>
          <motion.span className="font-display tabular-nums">{percent}</motion.span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-line">
          <motion.i className="block h-full origin-left rounded-full bg-lime" style={{ scaleX: progress }} />
        </div>
        <ul className="m-0 grid list-none gap-3 p-0">
          {copy.checklist.map((item, index) => {
            const done = index < ticked;
            return (
              <li key={item} className={clsx("flex items-center gap-3 font-semibold transition-colors duration-300", done ? "text-fg" : "text-fg-2")}>
                <span className="grid size-6.5 flex-none place-items-center rounded-full border-[1.5px] border-line">
                  <motion.span
                    initial={false}
                    animate={done ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="grid size-6.5 place-items-center rounded-full bg-lime text-on-lime"
                  >
                    <Icon name="check" size={14} strokeWidth={3} />
                  </motion.span>
                </span>
                {item}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
