"use client";

import { stagger, useAnimate } from "motion/react";
import type { CSSProperties } from "react";
import { aiRanking as copy } from "@/data/shopify";
import { AiChatDemo } from "@/components/sections/shopify/AiChatDemo";
import { Highlight } from "@/components/ui/Highlight";
import { Pill } from "@/components/ui/Pill";
import { RichText } from "@/components/ui/RichText";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { leadClass, sectionClass } from "@/lib/styles";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * "Rank your website in ChatGPT, Claude & AI tools." The heading lines rise as
 * the lime box wipes in, the AI tool chips spring in and float, the steps slide
 * in, and the chat demo shows a store climbing to the top of an AI answer.
 */
export function AiRanking() {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInViewOnce(scope, { amount: 0.3 });
  const reduced = useReducedMotionSoft();

  useRevealOnce(inView, () => {
    if (reduced) {
      return animate("[data-reveal]", { opacity: [0, 1] }, { duration: 0.4, delay: stagger(0.05) });
    }
    return Promise.all([
      animate("[data-geo-line]", { opacity: [0, 1], y: [60, 0] }, { duration: 0.8, ease: EASE, delay: stagger(0.12) }),
      animate(
        "[data-geo-tool]",
        { opacity: [0, 1], scale: [0.4, 1], y: [30, 0] },
        { delay: stagger(0.08, { startDelay: 0.9 }), opacity: { duration: 0.3 }, default: { type: "spring", stiffness: 380, damping: 14 } },
      ),
      animate(
        "[data-geo-step]",
        { opacity: [0, 1], x: [-40, 0] },
        { duration: 0.8, ease: EASE, delay: stagger(0.12, { startDelay: 1.2 }) },
      ),
    ]);
  });

  return (
    <section id="ai-ranking" className={sectionClass}>
      <div className="wrap grid items-center gap-12 min-[960px]:grid-cols-[1.05fr_0.95fr]">
        <div ref={scope}>
          <Pill>{copy.pill}</Pill>
          <h2 className="mb-6.5 text-[clamp(2.5rem,5.8vw,5rem)] leading-[1.02] font-extrabold tracking-[-0.045em]">
            <span data-reveal="" data-geo-line="" className="block">
              {copy.title[0]}
            </span>
            <span data-reveal="" data-geo-line="" className="block">
              {" "}
              <Highlight play={inView} delay={reduced ? 0 : 0.45}>
                {copy.title[1]}
              </Highlight>
            </span>
            <span data-reveal="" data-geo-line="" className="block text-lime-text">
              {" "}
              {copy.title[2]}
            </span>
          </h2>
          <p className={`${leadClass} mb-7 [&_b]:text-fg`}>
            <RichText text={copy.lead} />
          </p>
          <ul aria-label="AI tools" className="mb-8 flex flex-wrap gap-2.5">
            {copy.tools.map((tool, index) => (
              <li
                key={tool.name}
                data-reveal=""
                data-geo-tool=""
                className="inline-flex animate-bob items-center gap-2 rounded-full border border-glass-border bg-glass px-4.5 py-2.5 font-extrabold backdrop-blur-md"
                style={{ animationDelay: `${index * -0.8}s`, "--tool": tool.color } as CSSProperties}
              >
                <i aria-hidden="true" className="size-2.5 rounded-full bg-(--tool) shadow-[0_0_12px_var(--tool)]" />
                {tool.name}
              </li>
            ))}
          </ul>
          <ol className="grid gap-3.5">
            {copy.steps.map((step, index) => (
              <li key={step.title} data-reveal="" data-geo-step="" className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="grid size-8.5 flex-none place-items-center rounded-[10px] bg-lime font-extrabold text-on-lime"
                >
                  {index + 1}
                </span>
                <div>
                  <b className="block">{step.title}</b>
                  <span className="text-fg-2">{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <AiChatDemo />
      </div>
    </section>
  );
}
