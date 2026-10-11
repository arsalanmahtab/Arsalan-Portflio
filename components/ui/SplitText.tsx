"use client";

import clsx from "clsx";
import { stagger, useAnimate } from "motion/react";
import { createElement, Fragment } from "react";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

/** Plain text, or the heading's one Instrument Serif italic accent. */
export type SplitPart = string | { accent: string };
export type SplitLine = SplitPart | readonly SplitPart[];

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  /** Each entry renders as its own masked line. */
  lines: readonly SplitLine[];
  className?: string;
  /** Extra classes per line, by index. */
  lineClassNames?: readonly (string | undefined)[];
  /** Letters rise into place the first time the heading scrolls into view. */
  reveal?: boolean;
  /** Seconds before the reveal starts. */
  delay?: number;
};

const textOf = (part: SplitPart) => (typeof part === "string" ? part : part.accent);

/**
 * A heading split into masked lines, words and letters. With `reveal` the
 * letters rise in on scroll (Motion); otherwise animate the `[data-split-char]`
 * spans yourself, e.g. with a GSAP scrub. Screen readers and crawlers get the
 * plain sentence once; the split copy is hidden from them.
 */
export function SplitText({ as = "h2", lines, className, lineClassNames, reveal = false, delay = 0 }: Props) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const inView = useInViewOnce(scope, { amount: 0, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotionSoft();

  useRevealOnce(reveal && inView, () =>
    reduced
      ? animate("[data-split-line]", { opacity: [0, 1] }, { duration: 0.4, delay: stagger(0.08, { startDelay: delay }) })
      : animate(
          "[data-split-char]",
          { y: ["120%", "0%"] },
          { duration: 1, ease: [0.16, 1, 0.3, 1], delay: stagger(0.02, { startDelay: delay }) },
        ),
  );

  const parts = lines.map((line) => (Array.isArray(line) ? line : [line]) as readonly SplitPart[]);
  const sentence = parts.map((line) => line.map(textOf).join("")).join(" ");

  return createElement(
    as,
    { ref: scope, className, "data-split-reveal": reveal ? "" : undefined },
    <span className="sr-only">{sentence}</span>,
    <span aria-hidden="true">
      {parts.map((line, lineIndex) => (
        <span
          key={lineIndex}
          data-split-line=""
          className={clsx("block overflow-hidden pb-[0.06em]", lineClassNames?.[lineIndex])}
        >
          {line.map((part, partIndex) => (
            <Fragment key={partIndex}>
              {textOf(part)
                .split(/(\s+)/)
                .map((token, tokenIndex) =>
                  /^\s*$/.test(token) ? (
                    token && <Fragment key={tokenIndex}> </Fragment>
                  ) : (
                    <span
                      key={tokenIndex}
                      className={clsx("inline-block whitespace-nowrap", typeof part !== "string" && "serif-accent")}
                    >
                      {Array.from(token).map((char, charIndex) => (
                        <span key={charIndex} data-split-char="" className="inline-block">
                          {char}
                        </span>
                      ))}
                    </span>
                  ),
                )}
            </Fragment>
          ))}
        </span>
      ))}
    </span>,
  );
}
