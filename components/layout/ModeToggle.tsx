"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { modeOrder, modes, type Mode } from "@/config/modes";
import { useModeTransition } from "@/components/providers/ModeTransition";

const icons: Record<Mode, ReactNode> = {
  shop: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M5 8h14l-1.2 12H6.2z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  software: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
    </svg>
  ),
};

/** [Shopify | Software] pill. The lime thumb springs to the chosen side as the page switch starts. */
export function ModeToggle() {
  const { mode, currentMode, switchTo } = useModeTransition();

  return (
    <nav
      aria-label="Choose portfolio"
      className="flex shrink-0 rounded-full border border-glass-border bg-fg/8 p-1"
    >
      {modeOrder.map((option) => {
        const active = mode === option;
        return (
          <Link
            key={option}
            href={modes[option].path}
            aria-current={currentMode === option ? "page" : undefined}
            onNavigate={(event) => {
              event.preventDefault();
              switchTo(option);
            }}
            className={clsx(
              "relative isolate inline-flex min-h-10 items-center gap-1.75 rounded-full px-3.5 text-[0.9rem] font-bold transition-colors duration-350 max-[420px]:px-2.5",
              active ? "text-on-lime" : "text-fg-2 hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId="mode-toggle-thumb"
                aria-hidden="true"
                className="absolute inset-0 -z-1 rounded-full bg-lime shadow-[0_6px_20px_-6px_var(--lime)]"
                transition={{ type: "spring", bounce: 0.35, duration: 0.55 }}
              />
            )}
            {/* Icons drop out where space is tight: small phones, and the band where section links first appear. */}
            <span className="max-[420px]:hidden min-[1120px]:max-[1279px]:hidden">{icons[option]}</span>
            {modes[option].toggleLabel}
          </Link>
        );
      })}
    </nav>
  );
}
