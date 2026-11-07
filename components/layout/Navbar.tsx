"use client";

import { useRef } from "react";
import { modes } from "@/config/modes";
import { site } from "@/config/site";
import { contactLabels } from "@/data/contact";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { useModeTransition } from "@/components/providers/ModeTransition";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { LogoMark } from "@/components/ui/LogoMark";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Floating glass navbar. Hides while scrolling down, comes back when scrolling up,
 * and always shows while something inside it has keyboard focus.
 */
export function Navbar() {
  const { currentMode } = useModeTransition();
  const header = useRef<HTMLElement>(null);

  useGSAP(() => {
    const setHidden = (hidden: boolean) => {
      if (header.current) header.current.dataset.hidden = String(hidden);
    };
    ScrollTrigger.create({
      start: 120,
      end: "max",
      onUpdate: (self) => setHidden(self.direction === 1),
      onLeaveBack: () => setHidden(false),
    });
  });

  return (
    <header
      ref={header}
      data-hidden="false"
      className="fixed inset-x-0 top-[env(safe-area-inset-top,0px)] z-50 transition-[translate] duration-[450ms] ease-[cubic-bezier(.6,0,.2,1)] data-[hidden=true]:not-focus-within:translate-y-[-110%]"
    >
      <div className="glass mx-auto mt-3 flex h-16 w-[calc(100%-24px)] max-w-[1240px] items-center gap-7 rounded-full pr-2.5 pl-6 max-[760px]:gap-3 max-[620px]:pl-5">
        {/* Logo mark and two-line wordmark: the full navbar only fits the 1240px pill with the name stacked. */}
        <a
          href="#top"
          className="mr-auto flex items-center gap-2.5 font-display text-[1.2rem] leading-[0.92] font-extrabold max-[620px]:gap-2 max-[620px]:text-base"
        >
          <LogoMark className="max-[620px]:h-8.5" />
          <span className="w-min">{site.name}</span>
        </a>
        <nav
          aria-label={`${modes[currentMode].toggleLabel} sections`}
          className="hidden gap-4.5 text-[0.9rem] min-[1120px]:flex min-[1280px]:gap-6.5 min-[1280px]:text-base"
        >
          {modes[currentMode].sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="font-semibold whitespace-nowrap text-fg-2 transition-colors duration-200 hover:text-fg"
            >
              {section.label}
            </a>
          ))}
        </nav>
        <ModeToggle />
        <div className="hidden min-[620px]:block">
          <AnimatedButton href="#contact" variant="primary" size="sm">
            {contactLabels.startProject}
          </AnimatedButton>
        </div>
      </div>
    </header>
  );
}
