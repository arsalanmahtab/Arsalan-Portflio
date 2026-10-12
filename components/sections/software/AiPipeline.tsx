import type { CSSProperties } from "react";
import { aiSection as copy } from "@/data/software";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";
import { AgentTerminal } from "./AgentTerminal";
import styles from "./AiPipeline.module.css";

/** "AI apps, end to end": the pipeline from your data to an answer, and an agent at work. */
export function AiPipeline() {
  return (
    <section id="ai" className={sectionClass}>
      <div className="wrap">
        <Pill>{copy.pill}</Pill>
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <p className="mb-10 max-w-[34em] text-[1.15rem] text-fg-2">{copy.lead}</p>
        <SectionReveal stagger={0.12}>
          <ol aria-label={copy.pipelineLabel} className={`glass ${styles.pipeline}`}>
            {copy.pipeline.map((node, index) => (
              <li key={node.title} className={styles.node} style={{ "--i": index } as CSSProperties}>
                <b>{node.title}</b>
                <small>{node.text}</small>
                {index < copy.pipeline.length - 1 && (
                  <span aria-hidden="true" className={styles.link}>
                    <i />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <AgentTerminal />
        </SectionReveal>
      </div>
    </section>
  );
}
