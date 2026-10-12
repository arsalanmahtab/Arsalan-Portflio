"use client";

import clsx from "clsx";
import { useId, useState, useSyncExternalStore } from "react";
import type { FaqItem } from "@/data/faq";
import { Icon } from "@/components/ui/Icon";
import { SectionReveal } from "@/components/ui/SectionReveal";

const subscribeNever = () => () => {};

/**
 * Glass accordion. Answers open smoothly (grid rows 0fr → 1fr) while the + turns
 * into an ×. Closed answers stay in the page for search engines but are inert.
 * Without JavaScript every answer shows open, since nothing could open them.
 */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());
  const baseId = useId();
  // False in the server HTML, so answers are only made inert once the accordion works.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <SectionReveal className="grid max-w-215 gap-3" stagger={0.08} distance={40}>
      {items.map((item, index) => {
        const isOpen = open.has(index);
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div key={item.question} className="glass rounded-[20px]">
            <h3 className="m-0 font-sans text-[1.08rem] font-bold tracking-normal">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-6 py-5.5 text-left"
              >
                {item.question}
                <span
                  aria-hidden="true"
                  className={clsx(
                    "grid size-8.5 flex-none place-items-center rounded-full border transition-[rotate,background-color,color,border-color] duration-450 ease-[cubic-bezier(.2,.8,.2,1)] noscript:hidden",
                    isOpen ? "rotate-45 border-lime bg-lime text-on-lime" : "border-glass-border",
                  )}
                >
                  <Icon name="plus" size={16} strokeWidth={2.4} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={hydrated && !isOpen}
              className={clsx(
                "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] noscript:grid-rows-[1fr]",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="m-0 px-6 pb-5.5 text-fg-2">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </SectionReveal>
  );
}
