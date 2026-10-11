"use client";

import Link from "next/link";
import { modes, otherMode, type Mode } from "@/config/modes";
import { useModeTransition } from "@/components/providers/ModeTransition";

/** The glass pill in each hero that leads to the other portfolio, e.g. "Hiring a software engineer? See my full stack work →". */
export function ModeSwitchLink({ from }: { from: Mode }) {
  const { switchTo } = useModeTransition();
  const to = otherMode(from);
  const { lead, action } = modes[from].crossLink;

  return (
    <Link
      href={modes[to].path}
      onNavigate={(event) => {
        event.preventDefault();
        switchTo(to);
      }}
      className="group mt-5.5 inline-flex min-h-11.5 w-fit flex-wrap items-center gap-x-2 rounded-full border border-glass-border bg-glass px-4.5 py-2 text-[0.95rem] font-semibold text-fg-2 backdrop-blur-md transition-colors duration-300 hover:border-lime"
    >
      {lead}
      <b className="text-fg">{action}</b>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        aria-hidden="true"
        className="text-lime-text transition-[translate] duration-350 ease-[cubic-bezier(.3,1.4,.5,1)] group-hover:translate-x-1.5"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
