"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { aiRanking } from "@/data/shopify";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Icon } from "@/components/ui/Icon";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

const chat = aiRanking.chat;
const WINNER = chat.results.length - 1;
/** Display order once the optimised store has climbed to the top. */
const RANKED = [WINNER, ...chat.results.map((_, index) => index).slice(0, WINNER)];
const UNRANKED = chat.results.map((_, index) => index);

type Phase = "idle" | "typing" | "thinking" | "answer" | "ranked" | "done";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A shopper's question types out, the assistant thinks, four stores appear,
 * then yourstore.com springs from #4 to #1 (Motion layout) and earns a badge.
 */
export function AiChatDemo() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(box, { amount: 0.4 });
  const reduced = useReducedMotionSoft();
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const runId = useRef(0);

  const play = useCallback(async () => {
    const id = ++runId.current;
    const stale = () => id !== runId.current;
    setPhase("typing");
    setTyped(0);
    if (reduced) setTyped(chat.question.length);
    else
      for (let index = 1; index <= chat.question.length; index++) {
        await wait(26);
        if (stale()) return;
        setTyped(index);
      }
    setPhase("thinking");
    await wait(reduced ? 400 : 1100);
    if (stale()) return;
    setPhase("answer");
    await wait(reduced ? 700 : 1900);
    if (stale()) return;
    setPhase("ranked");
    await wait(650);
    if (stale()) return;
    setPhase("done");
  }, [reduced]);

  useRevealOnce(inView, () => {
    play();
  });

  // Stop the sequence if the component goes away.
  useEffect(() => () => void runId.current++, []);

  const listed = phase === "answer" || phase === "ranked" || phase === "done";
  const ranked = phase === "ranked" || phase === "done";
  const order = ranked ? RANKED : UNRANKED;

  return (
    <div ref={box} className="glass glass-sheen rounded-[28px] p-5.5">
      <div className="mb-4 flex items-center gap-2.5 border-b border-line pb-3.5">
        <span
          aria-hidden="true"
          className="size-8.5 flex-none animate-angle rounded-full bg-[conic-gradient(from_var(--angle),var(--lime),var(--violet),var(--lime))]"
        />
        <div>
          <b className="block leading-tight">{chat.name}</b>
          <small className="text-fg-2">{chat.caption}</small>
        </div>
      </div>

      {/* The invisible full question sizes the bubble up front, so typing never moves the layout. */}
      <p
        className={clsx(
          "relative ml-auto w-fit max-w-[88%] rounded-[16px_16px_4px_16px] bg-violet px-3.5 py-2.5 font-semibold text-on-violet transition-opacity duration-300",
          phase === "idle" ? "opacity-0" : "opacity-100",
        )}
      >
        <span className="invisible" aria-hidden="true">
          {chat.question}
        </span>
        <span className="absolute inset-0 px-3.5 py-2.5">{chat.question.slice(0, typed)}</span>
      </p>

      <div
        aria-hidden="true"
        className={clsx(
          "flex gap-1.25 px-1 py-3 transition-opacity duration-300",
          phase === "thinking" ? "opacity-100" : "opacity-0",
        )}
      >
        {[0, 0.15, 0.3].map((delay) => (
          <i
            key={delay}
            className="size-1.75 animate-typing rounded-full bg-fg-2"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <p className={clsx("mb-2.5 text-[0.9rem] text-fg-2 transition-opacity duration-400", listed ? "opacity-100" : "opacity-0")}>
        {chat.answer}
      </p>

      <ol aria-live="polite" className="grid h-64 content-start gap-2">
        {listed &&
          order.map((resultIndex, position) => {
            const result = chat.results[resultIndex];
            const winner = ranked && resultIndex === WINNER;
            return (
              <motion.li
                key={result.name}
                layout
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: ranked ? 0 : resultIndex * 0.12,
                  layout: { type: "spring", stiffness: 170, damping: 19 },
                }}
                className={clsx(
                  "relative flex h-14.5 items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 transition-[background-color,border-color,box-shadow] duration-500",
                  winner
                    ? "z-2 border-lime bg-lime/16 shadow-[0_0_36px_-8px_var(--lime)]"
                    : "border-transparent bg-fg/6",
                )}
              >
                <span className="w-8.5 flex-none font-display font-extrabold">#{position + 1}</span>
                <span>
                  <b className="block text-[0.95rem] leading-tight">{result.name}</b>
                  <small className="text-[0.8rem] text-fg-2">{result.note}</small>
                </span>
              </motion.li>
            );
          })}
      </ol>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <motion.span
          initial={false}
          animate={phase === "done" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="inline-flex items-center gap-2 rounded-full bg-lime px-3.5 py-2 text-[0.9rem] font-extrabold text-on-lime"
        >
          <Icon name="spark" size={16} />
          {chat.badge}
        </motion.span>
        <AnimatedButton size="sm" magnetic={false} onClick={play}>
          {chat.replay}
        </AnimatedButton>
      </div>
      <p className="mt-3 text-[0.8rem] text-fg-2">{chat.note}</p>
    </div>
  );
}
