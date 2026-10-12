"use client";

import clsx from "clsx";
import { AnimatePresence, motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { softwareHero as copy } from "@/data/software";
import { ModeSwitchLink } from "@/components/layout/ModeSwitchLink";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Highlight } from "@/components/ui/Highlight";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { useIntroReady } from "@/lib/intro";
import { CodeEditor } from "./CodeEditor";
import styles from "./SoftwareHero.module.css";

const ROTATE_EVERY_MS = 2600;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Software home hero: kicker, a headline whose last line swaps between
 * "SaaS products.", "AI startups." and more with a spring, the lime
 * highlight, and a code editor typing real snippets with tech badges
 * floating around it. The intro waits for the first-visit loader.
 */
export function SoftwareHero() {
  const [scope, animate] = useAnimate<HTMLElement>();
  const inner = useRef<HTMLDivElement>(null);
  const introReady = useIntroReady();
  const reduced = useReducedMotionSoft();
  const inView = useInView(scope, { amount: 0.2 });
  const [rotating, setRotating] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  // Intro: lines and copy rise in one after another, then the badges spring in.
  useRevealOnce(introReady, () =>
    Promise.all([
      animate(
        "[data-reveal]",
        reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [60, 0] },
        { duration: reduced ? 0.5 : 0.9, ease: EASE_OUT, delay: stagger(0.09, { startDelay: 0.15 }) },
      ),
      animate(
        "[data-pop]",
        reduced ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0.3, 1] },
        reduced
          ? { duration: 0.4, delay: stagger(0.05, { startDelay: 0.4 }) }
          : { type: "spring", stiffness: 380, damping: 14, delay: stagger(0.08, { startDelay: 0.7 }) },
      ),
    ]).then(() => setRotating(true)),
  );

  // The last line changes every 2.6s while the hero is on screen.
  useEffect(() => {
    if (!rotating || !inView) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setWordIndex((index) => (index + 1) % copy.rotatingWords.length);
    }, ROTATE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [rotating, inView]);

  // As you scroll away, the hero lifts and fades.
  useGSAP(
    () => {
      if (reduced || !scope.current) return;
      gsap.to(inner.current, {
        yPercent: -12,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope, dependencies: [reduced], revertOnUpdate: true },
  );

  const word = copy.rotatingWords[wordIndex];

  return (
    <section ref={scope} aria-labelledby="software-hero-title" className="relative flex min-h-svh items-center overflow-x-clip pt-30 pb-17.5">
      {/* grid-cols-1 (minmax(0, 1fr)) so the editor's tab bar can't widen the column past the screen. */}
      <div ref={inner} className="wrap grid w-full grid-cols-1 items-center gap-14 min-[1000px]:grid-cols-2">
        <div>
          <p data-reveal="" className="mb-5 font-semibold text-fg-2">
            {copy.kicker}
          </p>
          {/* Sized so "& AI apps for" (about 9.3em) fits its column: three lines, never more. */}
          <h1
            id="software-hero-title"
            className="mb-6.5 text-[clamp(2rem,9vw,4.2rem)] leading-[0.92] font-extrabold tracking-tighter min-[1000px]:text-[clamp(2.4rem,4.3vw,3.5rem)]"
          >
            <span className="sr-only">{`${copy.titleLines.join(" ")} ${copy.rotatingWords[0]}`}</span>
            <span aria-hidden="true">
              {copy.titleLines.map((line) => (
                <span key={line} data-reveal="" className="block">
                  {line}
                </span>
              ))}
              <span data-reveal="" className="block overflow-hidden pb-[0.08em]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={word}
                    className="serif-accent inline-block whitespace-nowrap text-violet"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: "60%" }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: reduced ? { duration: 0.3 } : { type: "spring", stiffness: 300, damping: 18 },
                    }}
                    exit={
                      reduced
                        ? { opacity: 0, transition: { duration: 0.25 } }
                        : { opacity: 0, y: "-60%", transition: { duration: 0.3, ease: "easeIn" } }
                    }
                  >
                    {word}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </h1>
          <p className="mb-7.5 font-display text-[clamp(1.05rem,2vw,1.3rem)] tracking-[-0.01em]">
            {/* Wraps in the half-width column; balanced so no word is left alone on the second line. */}
            <Highlight play={introReady} delay={0.6} className="text-balance">
              {copy.highlight}
            </Highlight>
          </p>
          <p data-reveal="" className="mb-8.5 max-w-[30em] text-[1.2rem] text-fg-2">
            {copy.subtitle}
          </p>
          <div data-reveal="" className="flex flex-wrap gap-3">
            <AnimatedButton href={copy.primaryCta.href} variant="primary">
              {copy.primaryCta.label}
            </AnimatedButton>
            <AnimatedButton href={copy.secondaryCta.href}>{copy.secondaryCta.label}</AnimatedButton>
          </div>
          <div data-reveal="">
            <ModeSwitchLink from="software" />
          </div>
        </div>

        <div data-reveal="" className={clsx(styles.visual, "min-w-0")}>
          <CodeEditor active={rotating && inView} />
          {copy.badges.map((badge) => (
            <span
              key={badge.label}
              aria-hidden="true"
              data-pop=""
              className={clsx(styles.badge, badge.lime && styles.lime)}
              style={
                {
                  "--x": `${badge.desktop[0]}%`,
                  "--y": `${badge.desktop[1]}%`,
                  "--mx": `${badge.mobile[0]}%`,
                  "--my": `${badge.mobile[1]}%`,
                } as CSSProperties
              }
            >
              <span className={styles.badgeLabel} style={{ "--delay": `${badge.delay}s` } as CSSProperties}>
                {badge.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
