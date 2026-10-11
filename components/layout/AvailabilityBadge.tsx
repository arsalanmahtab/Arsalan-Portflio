"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/config/site";
import { contactLabels } from "@/data/contact";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: site.timeZone,
  hour: "numeric",
  minute: "2-digit",
});

// A tiny shared clock: one 30-second interval while anything is subscribed.
let now: string | null = null;
let timer: number | undefined;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) {
    now = formatter.format(new Date());
    timer = window.setInterval(() => {
      now = formatter.format(new Date());
      listeners.forEach((listener) => listener());
    }, 30_000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.clearInterval(timer);
  };
}

const getSnapshot = () => (now ??= formatter.format(new Date()));
const getServerSnapshot = () => null;

/** "Available for new projects · Pakistan, 3:42 PM" with a pulsing status dot. */
export function AvailabilityBadge() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <p className="glass glass-sheen inline-flex items-center gap-2.5 rounded-[1.6rem] px-4.5 py-2.5 font-bold">
      <span
        aria-hidden="true"
        className="relative size-2.25 shrink-0 rounded-full bg-mint before:absolute before:inset-0 before:animate-pulse-ring before:rounded-full before:bg-mint"
      />
      <span>
        {contactLabels.availability}{" "}
        {/* Rendered on the client only; the invisible stand-in keeps the badge from changing size. */}
        <span className="font-semibold whitespace-nowrap text-fg-2 tabular-nums">
          {time ? (
            `· ${contactLabels.timePlace}, ${time}`
          ) : (
            <span className="invisible">· {contactLabels.timePlace}, 12:00 PM</span>
          )}
        </span>
      </span>
    </p>
  );
}
