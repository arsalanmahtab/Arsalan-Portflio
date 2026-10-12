"use client";

import clsx from "clsx";
import { useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { voiceAssistant as copy } from "@/data/shopify";
import { answerFromKeywords } from "@/data/voiceAnswers";
import { Icon } from "@/components/ui/Icon";
import styles from "./VoicePanel.module.css";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";
type Line = { id: number; who: "you" | "assistant"; text: string; shown: number };

const BARS = 30;
const TYPE_MS = 24;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Answer from /api/assistant (AI when configured, keyword rules otherwise); keyword rules if offline. */
async function fetchAnswer(question: string) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Assistant returned ${response.status}`);
    const data: { answer?: string } = await response.json();
    return data.answer || answerFromKeywords(question);
  } catch {
    return answerFromKeywords(question);
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Talk to the assistant: tap the orb to ask out loud (Web Speech API), or pick
 * a preset question. The answer is spoken (speechSynthesis) and typed into the
 * transcript; the orb and waveform follow the state.
 */
export function VoicePanel() {
  const panel = useRef<HTMLDivElement>(null);
  const orb = useRef<HTMLButtonElement>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const transcript = useRef<HTMLDivElement>(null);
  const inView = useInView(panel, { amount: 0.1 });

  const [state, setState] = useState<VoiceState>("idle");
  const [status, setStatus] = useState(copy.status.idle);
  const [lines, setLines] = useState<Line[]>([]);
  const stateRef = useRef<VoiceState>("idle");
  const runId = useRef(0);
  const lineId = useRef(0);
  const recognition = useRef<SpeechRecognitionInstance | null>(null);

  const changeState = useCallback((next: VoiceState, message?: string) => {
    stateRef.current = next;
    setState(next);
    if (message) setStatus(message);
  }, []);

  const addLine = useCallback((who: Line["who"], text: string, shown = text.length) => {
    const id = ++lineId.current;
    setLines((current) => [...current, { id, who, text, shown }].slice(-3));
    return id;
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const run = ++runId.current;
      const stale = () => run !== runId.current;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      addLine("you", question);
      changeState("thinking", copy.status.thinking);

      const answer = await fetchAnswer(question);
      if (stale()) return;
      changeState("speaking", copy.status.speaking);

      let speaking = false;
      if ("speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(answer);
          utterance.rate = 1.02;
          utterance.onend = () => {
            if (!stale()) changeState("idle", copy.status.idle);
          };
          window.speechSynthesis.speak(utterance);
          speaking = true;
          // Some browsers never finish an utterance (no voices or audio device); don't stay stuck on "Speaking".
          window.setTimeout(() => {
            if (stale() || stateRef.current !== "speaking") return;
            window.speechSynthesis.cancel();
            changeState("idle", copy.status.idle);
          }, answer.length * 90 + 3000);
        } catch {}
      }

      const id = addLine("assistant", answer, 0);
      for (let shown = 1; shown <= answer.length; shown++) {
        await wait(TYPE_MS);
        if (stale()) return;
        setLines((current) => current.map((line) => (line.id === id ? { ...line, shown } : line)));
      }
      await wait(700);
      if (stale()) return;
      if (!speaking || !window.speechSynthesis.speaking) changeState("idle", copy.status.idle);
    },
    [addLine, changeState],
  );

  const onOrb = () => {
    if (stateRef.current === "listening") {
      recognition.current?.stop();
      return;
    }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      changeState("idle", copy.status.unsupported);
      return;
    }
    runId.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const listener = new Recognition();
    listener.lang = "en-US";
    listener.interimResults = false;
    listener.maxAlternatives = 1;
    let heard = false;
    listener.onresult = (event) => {
      heard = true;
      ask(event.results[0][0].transcript);
    };
    listener.onerror = (event) =>
      changeState(
        "idle",
        /not-allowed|service-not-allowed|audio-capture/.test(event.error) ? copy.status.noMicrophone : copy.status.noSpeech,
      );
    listener.onend = () => {
      if (!heard && stateRef.current === "listening") changeState("idle", copy.status.noSpeech);
    };
    recognition.current = listener;
    try {
      listener.start();
      changeState("listening", copy.status.listening);
    } catch {
      changeState("idle", copy.status.noMicrophone);
    }
  };

  // Keep the newest words in view as the answer types out.
  useEffect(() => {
    const box = transcript.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  // Stop speaking and listening when the panel goes away.
  useEffect(
    () => () => {
      runId.current++;
      recognition.current?.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );

  // Waveform and orb level, only while the panel is on screen and the tab is visible.
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    let level = 0;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden) return;
      const current = stateRef.current;
      const amp = current === "speaking" ? 1 : current === "listening" ? 0.6 : 0;
      level += ((amp ? amp * (0.4 + Math.random() * 0.6) : 0) - level) * 0.2;
      orb.current?.style.setProperty("--level", level.toFixed(3));
      bars.current.forEach((bar, index) => {
        if (!bar) return;
        const value = amp
          ? 0.15 + amp * Math.abs(Math.sin(time / (110 + index * 6) + index)) * (0.55 + Math.random() * 0.45)
          : 0.12 + 0.1 * (1 + Math.sin(time / 420 + index * 0.45));
        bar.style.transform = `scaleY(${value.toFixed(3)})`;
      });
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  return (
    <div ref={panel} className="glass flex flex-col items-center gap-3.5 rounded-[32px] px-6 pt-8.5 pb-6">
      <button
        ref={orb}
        type="button"
        data-state={state}
        data-active={inView}
        data-cursor="Talk"
        aria-label={state === "listening" ? copy.stop : copy.talk}
        className={styles.orb}
        onClick={onOrb}
      >
        <span className={styles.ring} />
        <span className={styles.ring} />
        <span className={styles.ring} />
        <span className={styles.core} />
        <Icon name="mic" size={34} strokeWidth={2.2} className={styles.icon} />
      </button>

      <div aria-hidden="true" className={styles.wave}>
        {Array.from({ length: BARS }, (_, index) => (
          <i
            key={index}
            ref={(node) => {
              bars.current[index] = node;
            }}
          />
        ))}
      </div>

      {/* Full width with room for two lines, so a longer message never moves or pushes anything. */}
      <p role="status" className="m-0 flex min-h-[3.2em] w-full items-center justify-center text-center font-bold">
        {status}
      </p>

      {/* Fixed height, scrolled to the newest line, so typing never moves the rest of the page. */}
      <div ref={transcript} aria-live="polite" className="flex h-62.5 w-full flex-col gap-2 overflow-y-auto text-[0.95rem]">
        {lines.map((line) => (
          <p
            key={line.id}
            className={clsx(
              "m-0 rounded-[14px] px-3.5 py-2.5",
              line.who === "you" ? "self-end bg-violet/25" : "bg-fg/6",
            )}
          >
            <b className="block text-[0.78rem] text-fg-2">{line.who === "you" ? copy.you : copy.assistant}</b>
            {/* Screen readers get the whole line once; the typed copy is visual only. */}
            <span className="sr-only">{line.text}</span>
            <span aria-hidden="true">{line.text.slice(0, line.shown)}</span>
          </p>
        ))}
      </div>

      <ul aria-label={copy.questionsLabel} className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
        {copy.questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => ask(question)}
              className="min-h-10 rounded-full border border-glass-border bg-fg/6 px-3.5 text-[0.88rem] font-semibold text-fg transition-[background-color,color,translate] duration-300 hover:-translate-y-0.5 hover:bg-violet hover:text-on-violet"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-1 text-center text-[0.82rem] text-fg-2">{copy.note}</p>
    </div>
  );
}
