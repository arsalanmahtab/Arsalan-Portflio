"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { buildSection } from "@/data/software";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

const copy = buildSection.cards.ai;
const words = copy.answer.split(" ");
const WORD_EVERY_MS = 90;
const HOLD_MS = 2600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A question, then an answer streaming in word by word, on a loop while on
 * screen. The answer's full text sits invisibly underneath, so its bubble is
 * its final size from the start and nothing moves while it streams.
 */
export function AiAnswerDemo() {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reduced = useReducedMotionSoft();
  const [shown, setShown] = useState(words.length);

  useEffect(() => {
    if (!inView || reduced) return;
    let stopped = false;
    (async () => {
      while (!stopped) {
        for (let count = 0; count <= words.length && !stopped; count++) {
          setShown(count);
          await wait(WORD_EVERY_MS);
        }
        await wait(HOLD_MS);
      }
    })();
    return () => {
      stopped = true;
      setShown(words.length);
    };
  }, [inView, reduced]);

  return (
    <div ref={root} className="flex flex-1 flex-col justify-center gap-2 text-[0.85rem] leading-snug">
      <p className="m-0 self-end rounded-[12px_12px_4px_12px] bg-violet px-3 py-2 font-semibold text-on-violet">
        {copy.question}
      </p>
      <p className="relative m-0 max-w-[92%] self-start rounded-[12px_12px_12px_4px] border border-glass-border bg-glass px-3 py-2">
        <span className="invisible">{copy.answer}</span>
        <span className="absolute inset-0 px-3 py-2">{words.slice(0, shown).join(" ")}</span>
      </p>
    </div>
  );
}
