"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { footerRobot as copy } from "@/data/contact";
import type { FooterRobotStage } from "@/components/characters/FooterRobot3D";
import { FooterRobotScene } from "@/components/characters/scenes";
import { Stage3D } from "@/components/characters/Stage3D";
import bubbleStyles from "@/components/characters/SpeechBubble.module.css";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { setFooterRobotVisible } from "@/lib/robotPresence";

/**
 * A 240px strip in the contact section with a dashed floor. Each time it scrolls
 * into view the robot visits: glides in, waves and says thanks, glides off.
 * Afterwards a button brings it back.
 */
export function FooterRobot() {
  const strip = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotionSoft();
  const [run, setRun] = useState(0);
  const [finishedRun, setFinishedRun] = useState(0);
  const [stage, setStage] = useState<FooterRobotStage>("waiting");
  const visiting = useRef(false);

  const onStage = useCallback((next: FooterRobotStage, which: number) => {
    visiting.current = next === "visiting";
    setStage(next);
    if (next === "done") setFinishedRun(which);
    setFooterRobotVisible(next === "visiting");
  }, []);

  // Visit each time the strip is 60% in view, unless a visit is already under way.
  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6 && !visiting.current) setRun((current) => current + 1);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setFooterRobotVisible(false);
    };
  }, []);

  return (
    <div ref={strip} className="relative mb-8.5 h-60">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[19%] border-t-2 border-dashed border-line" />
      <Stage3D
        aria-hidden="true"
        className="absolute inset-0"
        scene={FooterRobotScene}
        sceneProps={{ run, finishedRun, reduced, bubble, onStage }}
      >
        <p ref={bubble} className={clsx(bubbleStyles.bubble, bubbleStyles.footer)}>
          {copy.bubble}
        </p>
      </Stage3D>
      <div
        inert={stage !== "done"}
        className={clsx(
          "absolute inset-0 grid place-items-center transition-opacity duration-500",
          stage === "done" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <AnimatedButton size="sm" onClick={() => setRun((current) => current + 1)}>
          {copy.replay}
        </AnimatedButton>
      </div>
    </div>
  );
}
