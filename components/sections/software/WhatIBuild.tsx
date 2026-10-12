import type { CSSProperties, ReactNode } from "react";
import { buildSection as copy } from "@/data/software";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";
import { AiAnswerDemo } from "./AiAnswerDemo";
import styles from "./WhatIBuild.module.css";

function Card({ title, text, demoLabel, children }: { title: string; text: string; demoLabel: string; children: ReactNode }) {
  return (
    <GlassCard as="article" className="flex flex-col gap-2.5 p-5.5">
      <div role="img" aria-label={demoLabel} className={styles.viz}>
        {children}
      </div>
      <h3 className="text-[1.35rem] leading-[1.15]">{title}</h3>
      <p className="m-0 text-fg-2">{text}</p>
    </GlassCard>
  );
}

/** Two packets, half a cycle apart, travelling along a pipe. */
function Pipe({ offset }: { offset: number }) {
  return (
    <span className={styles.pipe}>
      <span className={styles.packet} style={{ "--delay": `${-offset}s` } as CSSProperties} />
      <span className={styles.packet} style={{ "--delay": `${-offset - 1}s` } as CSSProperties} />
    </span>
  );
}

/** "What I build": four kinds of work, each with a live mini demo. */
export function WhatIBuild() {
  const { fullStack, ai, saas, apis } = copy.cards;
  const [front, api, data] = fullStack.flow;

  return (
    <section id="build" className={sectionClass}>
      <div className="wrap">
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        {/* Two by two, so each demo has room to read. */}
        <SectionReveal className="mt-10 grid gap-4.5 md:grid-cols-2">
          <Card {...fullStack}>
            <div className={styles.flow}>
              <span className={styles.flowStep}>{front}</span>
              <Pipe offset={0} />
              <span className={styles.flowStep}>{api}</span>
              <Pipe offset={0.5} />
              <span className={styles.flowStep}>{data}</span>
            </div>
          </Card>

          <Card {...ai}>
            <AiAnswerDemo />
          </Card>

          <Card {...saas}>
            <div className={styles.chart}>
              <small className="font-bold text-fg-2">{saas.chartLabel}</small>
              <svg viewBox="-3 0 446 100">
                <path
                  className={styles.line}
                  pathLength={1}
                  d="M0 81 L60 73 L120 75 L180 57 L240 52 L300 36 L360 29 L440 8"
                  fill="none"
                  strokeWidth={3}
                  style={{ stroke: "var(--lime-text)" }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Card>

          <Card {...apis}>
            <ul className={styles.endpoints}>
              {apis.endpoints.map((endpoint, index) => (
                <li key={endpoint.request} className={styles.endpoint}>
                  <i style={{ "--delay": `${index}s` } as CSSProperties} />
                  {endpoint.request}
                  <b>{endpoint.status}</b>
                </li>
              ))}
            </ul>
          </Card>
        </SectionReveal>
      </div>
    </section>
  );
}
