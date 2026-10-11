import clsx from "clsx";
import { Fragment } from "react";

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
};

const textOf = (part: SplitPart) => (typeof part === "string" ? part : part.accent);

/**
 * A heading split into masked lines, words and letters for GSAP reveals.
 * Animate the `[data-split-char]` spans. Screen readers and crawlers get the
 * plain sentence once; the split copy is hidden from them.
 */
export function SplitText({ as: Tag = "h2", lines, className, lineClassNames }: Props) {
  const parts = lines.map((line) => (Array.isArray(line) ? line : [line]) as readonly SplitPart[]);
  const sentence = parts.map((line) => line.map(textOf).join("")).join(" ");

  return (
    <Tag className={className}>
      <span className="sr-only">{sentence}</span>
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
                        className={clsx(
                          "inline-block whitespace-nowrap",
                          typeof part !== "string" && "serif-accent",
                        )}
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
      </span>
    </Tag>
  );
}
