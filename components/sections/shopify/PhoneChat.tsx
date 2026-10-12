"use client";

import clsx from "clsx";
import { stagger, useAnimate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { aiAssistant } from "@/data/shopify";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

const chat = aiAssistant.chat;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const bubble = "rounded-[18px] px-3.5 py-2.5 text-[0.95rem] leading-[1.45]";
const botBubble = clsx(bubble, "rounded-bl-md border border-line bg-card");

/**
 * Phone mockup of an AI shopping assistant. Every message is laid out in its
 * final place from the start and revealed in turn, so the conversation never
 * shifts the page; without JavaScript it reads as a finished chat.
 */
export function PhoneChat() {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInViewOnce(scope, { amount: 0.35 });
  const reduced = useReducedMotionSoft();
  const [typed, setTyped] = useState(chat.question.length);
  const [thinking, setThinking] = useState(false);
  const runId = useRef(0);

  const play = useCallback(async () => {
    const id = ++runId.current;
    const stale = () => id !== runId.current;
    const pop = (selector: string) =>
      animate(
        selector,
        reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [20, 0] },
        reduced ? { duration: 0.3 } : { type: "spring", stiffness: 320, damping: 20, opacity: { duration: 0.25 } },
      );

    setThinking(false);
    await animate("[data-chat-item], [data-chat-pick]", { opacity: 0 }, { duration: 0.2 });
    if (stale()) return;
    setTyped(0);
    await pop("[data-chat-item='question']");
    if (reduced) setTyped(chat.question.length);
    else
      for (let index = 1; index <= chat.question.length; index++) {
        await wait(32);
        if (stale()) return;
        setTyped(index);
      }
    await wait(400);
    if (stale()) return;
    setThinking(true);
    await wait(reduced ? 500 : 1300);
    if (stale()) return;
    setThinking(false);
    await pop("[data-chat-item='reply']");
    await wait(300);
    if (stale()) return;
    animate("[data-chat-item='picks']", { opacity: 1 }, { duration: 0.01 });
    await animate(
      "[data-chat-pick]",
      reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [30, 0], scale: [0.8, 1] },
      reduced
        ? { duration: 0.3, delay: stagger(0.08) }
        : { type: "spring", stiffness: 300, damping: 16, delay: stagger(0.12), opacity: { duration: 0.25 } },
    );
    await wait(600);
    if (stale()) return;
    pop("[data-chat-item='follow-up']");
  }, [animate, reduced]);

  useRevealOnce(inView, () => {
    play();
  });

  // Stop the sequence if the component goes away.
  useEffect(() => () => void runId.current++, []);

  return (
    <div>
      <div ref={scope} className="glass mx-auto w-full max-w-100 rounded-[36px] p-4 shadow-[0_50px_100px_-40px_rgb(138_124_255/0.5)]">
        <div className="flex items-center gap-2.5 border-b border-line px-2 pt-2 pb-3.5">
          <span
            aria-hidden="true"
            className="size-9 animate-angle rounded-full bg-[conic-gradient(from_var(--angle),var(--violet),var(--lime),var(--violet))]"
          />
          <div>
            <b className="block leading-tight">{chat.name}</b>
            <small className="text-fg-2">{chat.caption}</small>
          </div>
        </div>

        <div className="flex h-105 flex-col justify-end gap-2.5 overflow-hidden px-1 py-4">
          {/* The full question sizes the bubble; the typed copy sits on top of it. */}
          <p data-chat-item="question" data-reveal="" className={clsx(bubble, "relative max-w-[82%] self-end rounded-br-md bg-violet text-on-violet")}>
            <span className="sr-only">{chat.question}</span>
            <span aria-hidden="true" className="invisible">
              {chat.question}
            </span>
            <span aria-hidden="true" className="absolute inset-0 px-3.5 py-2.5">
              {chat.question.slice(0, typed)}
            </span>
          </p>

          <div className="relative max-w-[82%] self-start">
            <div
              aria-hidden="true"
              className={clsx(
                "absolute top-0 left-0 flex gap-1.25 rounded-[18px] rounded-bl-md border border-line bg-card p-3.5 transition-opacity duration-200",
                thinking ? "opacity-100" : "opacity-0",
              )}
            >
              {[0, 0.15, 0.3].map((delay) => (
                <i key={delay} className="size-1.75 animate-typing rounded-full bg-fg-2" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
            <p data-chat-item="reply" data-reveal="" className={botBubble}>
              {chat.reply}
            </p>
          </div>

          <div data-chat-item="picks" data-reveal="" className="grid grid-cols-3 gap-2">
            {chat.picks.map((pick) => (
              <div key={pick.name} data-chat-pick="" data-reveal="" className="rounded-[14px] border border-line bg-card p-2 text-[0.78rem]">
                <i aria-hidden="true" className="mb-1.5 block aspect-square rounded-[10px]" style={{ background: pick.tint }} />
                <b className="block leading-tight">{pick.name}</b>
                {pick.price}
              </div>
            ))}
          </div>

          <p data-chat-item="follow-up" data-reveal="" className={clsx(botBubble, "max-w-[82%] self-start")}>
            {chat.followUp}
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex justify-center">
        <AnimatedButton size="sm" magnetic={false} onClick={play}>
          {chat.replay}
        </AnimatedButton>
      </div>
    </div>
  );
}
