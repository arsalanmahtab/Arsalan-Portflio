"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { aboutSection } from "@/data/software";
import { DevAndroidScene } from "@/components/characters/scenes";
import { Stage3D } from "@/components/characters/Stage3D";
import bubbleStyles from "@/components/characters/SpeechBubble.module.css";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

const copy = aboutSection.android;
const SPEAK_MS = 3200;

/**
 * The 3D developer android's stage. It waves and says the next line when the
 * section comes into view and on each click or Enter key; the line shows in a
 * speech bubble above its head.
 */
export function DevAndroid() {
  const outer = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotionSoft();
  const [greet, setGreet] = useState(0);
  const [line, setLine] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const said = useRef(0);

  const sayHi = useCallback(() => {
    setLine(copy.lines[said.current % copy.lines.length]);
    said.current += 1;
    setSpeaking(true);
    setGreet((current) => current + 1);
  }, []);

  // The bubble shows for 3.2s after the latest greeting.
  useEffect(() => {
    if (!speaking) return;
    const timer = window.setTimeout(() => setSpeaking(false), SPEAK_MS);
    return () => window.clearTimeout(timer);
  }, [speaking, greet]);

  // Say hi each time the stage comes into view.
  useEffect(() => {
    const element = outer.current;
    if (!element) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(sayHi, 500);
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [sayHi]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    sayHi();
  };

  return (
    <div ref={outer}>
      <Stage3D
        role="button"
        tabIndex={0}
        aria-label={copy.label}
        data-cursor="Say hi"
        onClick={sayHi}
        onKeyDown={onKeyDown}
        className="relative h-[clamp(400px,48vw,580px)] cursor-pointer rounded-[32px] before:pointer-events-none before:absolute before:inset-[6%_8%] before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_srgb,var(--violet)_38%,transparent),transparent_66%)]"
        scene={DevAndroidScene}
        sceneProps={{ greet, reduced, bubble }}
      >
        <p
          ref={bubble}
          aria-live="polite"
          data-show={speaking || undefined}
          className={clsx(bubbleStyles.bubble, bubbleStyles.android)}
        >
          {line}
        </p>
        <p className="absolute bottom-[2%] left-1/2 m-0 -translate-x-1/2 text-[0.85rem] font-bold whitespace-nowrap text-fg-2">
          {copy.hint}
        </p>
      </Stage3D>
    </div>
  );
}
