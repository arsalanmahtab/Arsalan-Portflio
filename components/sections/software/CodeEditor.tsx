"use client";

import { useEffect, useRef, useState } from "react";
import { softwareHero } from "@/data/software";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./SoftwareHero.module.css";

const copy = softwareHero.editor;
const TYPE_EVERY_MS = 16;
const CHARS_PER_STEP = 2;
const TOAST_AFTER_MS = 350;
const NEXT_TAB_AFTER_MS = 2400;

type Kind = "keyword" | "string" | "function";
type Token = { text: string; kind?: Kind };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Split a snippet into plain text, strings, keywords and function names. */
function tokenize(code: string): Token[] {
  const pattern = new RegExp(
    `('[^'\\n]*'|"[^"\\n]*")|\\b(${copy.keywords.join("|")})\\b|\\b(${copy.functions.join("|")})\\b`,
    "g",
  );
  const tokens: Token[] = [];
  let last = 0;
  for (const match of code.matchAll(pattern)) {
    if (match.index > last) tokens.push({ text: code.slice(last, match.index) });
    tokens.push({ text: match[0], kind: match[1] ? "string" : match[2] ? "keyword" : "function" });
    last = match.index + match[0].length;
  }
  if (last < code.length) tokens.push({ text: code.slice(last) });
  return tokens;
}

const snippets = copy.tabs.map((tab) => tokenize(tab.code));

/** Characters `from` to `to` of a snippet, coloured. */
function Slice({ tokens, from, to }: { tokens: Token[]; from: number; to: number }) {
  let start = 0;
  return tokens.map((token, index) => {
    const end = start + token.text.length;
    const text = token.text.slice(Math.max(0, from - start), Math.max(0, to - start));
    start = end;
    if (!text) return null;
    return token.kind ? (
      <span key={index} className={styles[token.kind]}>
        {text}
      </span>
    ) : (
      text
    );
  });
}

/**
 * The typed part of a snippet, the caret, then the rest kept invisible. The
 * whole snippet is always laid out, so a word never jumps to the next line as
 * it is typed.
 */
function Code({ tokens, shown }: { tokens: Token[]; shown: number }) {
  const length = tokens.reduce((total, token) => total + token.text.length, 0);
  return (
    <>
      <Slice tokens={tokens} from={0} to={shown} />
      <span className={styles.caret} />
      <span className={styles.pending}>
        <Slice tokens={tokens} from={shown} to={length} />
      </span>
    </>
  );
}

/**
 * A glass editor that types a Next.js page, a Laravel route group and an AI
 * agent call in turn, each followed by a toast. It only types while `active`
 * (intro done and on screen). The server HTML shows the first snippet in full.
 */
export function CodeEditor({ active }: { active: boolean }) {
  const reduced = useReducedMotionSoft();
  const [tab, setTab] = useState(0);
  const [shown, setShown] = useState(copy.tabs[0].code.length);
  const [toast, setToast] = useState(false);
  const current = useRef(0);

  useEffect(() => {
    if (!active) return;
    let stopped = false;
    const pause = async (ms: number) => {
      await wait(ms);
      while (!stopped && document.hidden) await wait(500);
      return !stopped;
    };

    (async () => {
      while (!stopped) {
        const index = current.current;
        const length = copy.tabs[index].code.length;
        setTab(index);
        setToast(false);
        if (reduced) {
          setShown(length);
        } else {
          for (let typed = 0; typed < length; typed += CHARS_PER_STEP) {
            setShown(typed);
            if (!(await pause(TYPE_EVERY_MS))) return;
          }
          setShown(length);
        }
        if (!(await pause(TOAST_AFTER_MS))) return;
        setToast(true);
        if (!(await pause(NEXT_TAB_AFTER_MS))) return;
        current.current = (index + 1) % copy.tabs.length;
      }
    })();

    return () => {
      stopped = true;
    };
  }, [active, reduced]);

  return (
    <div role="img" aria-label={copy.label} className="glass relative overflow-hidden rounded-[20px]">
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-glass-border px-3.5 py-2.5">
        <span className="mr-2 flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <i key={dot} className="size-2.5 rounded-full bg-fg/25" />
          ))}
        </span>
        {copy.tabs.map((item, index) => (
          <span key={item.file} className={styles.tab} data-active={index === tab || undefined}>
            {item.file}
          </span>
        ))}
      </div>

      <div className="grid">
        {copy.tabs.map((item) => (
          <pre key={item.file} className={`${styles.code} ${styles.sizer}`}>
            {item.code}
          </pre>
        ))}
        {/* Keyed by tab: each snippet mounts fresh (and fades in) rather than reusing the last one's text. */}
        <pre key={tab} className={`${styles.code} ${styles.current}`}>
          <Code tokens={snippets[tab]} shown={shown} />
        </pre>
      </div>

      <div className={styles.toast} data-show={toast || undefined}>
        {copy.tabs[tab].toast}
      </div>
    </div>
  );
}
