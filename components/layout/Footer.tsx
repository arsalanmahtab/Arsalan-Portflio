"use client";

import { site } from "@/config/site";
import { contactByMode, contactLabels } from "@/data/contact";
import { AvailabilityBadge } from "@/components/layout/AvailabilityBadge";
import { BackToTop } from "@/components/layout/BackToTop";
import { Signature } from "@/components/layout/Signature";
import { useModeTransition } from "@/components/providers/ModeTransition";

/** Availability and back-to-top row, the giant signature and the closing footer line. */
export function Footer() {
  const { currentMode } = useModeTransition();

  return (
    <footer className="wrap pb-12.5">
      <div className="mt-2.5 mb-7.5 flex flex-wrap items-center justify-between gap-5">
        {site.available && <AvailabilityBadge />}
        <div className="ml-auto">
          <BackToTop />
        </div>
      </div>
      <Signature />
      <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-[0.9rem] text-fg-2">
        <span>{contactLabels.footerName}</span>
        <span>{contactByMode[currentMode].footerNote}</span>
      </div>
    </footer>
  );
}
