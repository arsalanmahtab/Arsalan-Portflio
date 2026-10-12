import clsx from "clsx";
import { stackSection as copy } from "@/data/software";
import { orbitCore, orbitRings, stackGroups } from "@/data/stack";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";
import styles from "./Stack.module.css";

/** Pills spaced evenly around a ring, the first at the top. */
function Ring({ items, className }: { items: readonly string[]; className: string }) {
  return (
    <div className={clsx(styles.ring, className)}>
      {items.map((item, index) => {
        const angle = (index / items.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={item}
            className={styles.node}
            style={{ left: `${(50 + 50 * Math.cos(angle)).toFixed(2)}%`, top: `${(50 + 50 * Math.sin(angle)).toFixed(2)}%` }}
          >
            <span className={styles.pill}>{item}</span>
          </span>
        );
      })}
    </div>
  );
}

/** "One engineer, the whole stack": four stack groups beside a turning orbit of the tech. */
export function Stack() {
  return (
    <section id="stack" className={clsx(sectionClass, "overflow-x-clip")}>
      <div className="wrap grid items-center gap-12 min-[960px]:grid-cols-2">
        <div>
          <Pill>{copy.pill}</Pill>
          <SplitText reveal lines={copy.title} className={sectionTitleClass} />
          <p className="mb-8 max-w-[34em] text-[1.15rem] text-fg-2">{copy.lead}</p>
          <SectionReveal className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            {stackGroups.map((group) => (
              <div key={group.title} className="glass glass-sheen rounded-[18px] p-4.5">
                <h3 className="mb-1 font-sans text-base font-bold tracking-normal">{group.title}</h3>
                <p className="m-0 text-[0.95rem] text-fg-2">{group.items}</p>
              </div>
            ))}
          </SectionReveal>
        </div>

        {/* The same tech as the groups, so the orbit is decoration only. */}
        <SectionReveal distance={60}>
          <div aria-hidden="true" className={styles.orbit}>
            <Ring items={orbitRings.inner} className={styles.inner} />
            <Ring items={orbitRings.outer} className={styles.outer} />
            <div className={styles.core}>
              <b>{orbitCore.name}</b>
              <small>{orbitCore.role}</small>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
