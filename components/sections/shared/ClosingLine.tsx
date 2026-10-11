"use client";

import { useRef } from "react";
import { SplitText } from "@/components/ui/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

type Props = { lead: string; before: string; accent: string };

/** "Let's build your store." Letters rise into place as the contact section scrolls in. */
export function ClosingLine({ lead, before, accent }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSoft();

  useGSAP(
    () => {
      if (!wrapper.current) return;
      const chars = wrapper.current.querySelectorAll("[data-split-char]");
      gsap.from(chars, {
        ...(reduced ? { opacity: 0 } : { yPercent: 120, rotate: 12 }),
        stagger: 0.025,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapper.current.closest("section") ?? wrapper.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      });
    },
    { scope: wrapper, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div ref={wrapper}>
      <SplitText
        as="h2"
        lines={[lead, [`${before} `, { accent }]]}
        lineClassNames={[undefined, "text-violet"]}
        className="mb-11 font-display text-[clamp(3.2rem,11vw,10rem)] leading-[0.88] font-extrabold tracking-[-0.055em]"
      />
    </div>
  );
}
