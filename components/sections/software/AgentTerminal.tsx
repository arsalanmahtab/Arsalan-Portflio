"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { aiSection } from "@/data/software";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

const copy = aiSection.terminal;
const LINE_EVERY_MS = 650;
const HOLD_MS = 2600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Prompt lines in violet, finished steps with a lime tick. */
function Line({ text }: { text: string }) {
  if (text.startsWith(">")) {
    return (
      <span className="block">
        <span className="text-violet">&gt;</span>
        {text.slice(1)}
      </span>
    );
  }
  const tick = text.indexOf("✓");
  return (
    <span className="block">
      {text.slice(0, tick)}
      <span className="text-lime-text">✓</span>
      {text.slice(tick + 1)}
    </span>
  );
}

/**
 * An `agent.log` terminal that prints an agent's steps line by line, on a loop
 * while on screen. Sized for every line from the start, so printing moves nothing.
 */
export function AgentTerminal() {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reduced = useReducedMotionSoft();
  const [shown, setShown] = useState(copy.lines.length);

  useEffect(() => {
    if (!inView || reduced) return;
    let stopped = false;
    (async () => {
      while (!stopped) {
        for (let count = 0; count <= copy.lines.length && !stopped; count++) {
          setShown(count);
          await wait(LINE_EVERY_MS);
        }
        await wait(HOLD_MS);
      }
    })();
    return () => {
      stopped = true;
      setShown(copy.lines.length);
    };
  }, [inView, reduced]);

  return (
    <div ref={root} role="img" aria-label={copy.label} className="glass overflow-hidden rounded-[20px]">
      <div className="flex items-center gap-1.5 border-b border-glass-border px-3.5 py-2.5">
        <span className="mr-2 flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <i key={dot} className="size-2.5 rounded-full bg-fg/25" />
          ))}
        </span>
        <span className="rounded-lg bg-fg/10 px-2.5 py-1.5 font-mono text-[0.78rem] font-medium">{copy.file}</span>
      </div>
      <pre className="m-0 h-[calc(10.8em+36px)] overflow-hidden px-5 py-4.5 font-mono text-[0.85rem] leading-[1.8] font-medium whitespace-pre-wrap">
        {copy.lines.slice(0, shown).map((line) => (
          <Line key={line} text={line} />
        ))}
      </pre>
    </div>
  );
}
