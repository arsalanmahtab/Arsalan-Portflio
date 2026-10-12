import clsx from "clsx";
import type { ReactNode } from "react";
import { shopifyPlus as copy } from "@/data/shopify";
import { GlassCard } from "@/components/ui/GlassCard";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { leadClass, sectionClass, sectionTitleClass } from "@/lib/styles";
import styles from "./ShopifyPlus.module.css";

const spans = { 2: "min-[901px]:col-span-2", 4: "min-[901px]:col-span-4", 6: "min-[901px]:col-span-6" } as const;

function Tile({ span, title, text, children }: { span: 2 | 4 | 6; title: string; text: string; children: ReactNode }) {
  return (
    <GlassCard as="article" className={clsx("flex min-h-55 flex-col gap-2.5 p-6.5", spans[span])}>
      <h3 className="text-[1.35rem] leading-tight">{title}</h3>
      <p className="m-0 text-fg-2">{text}</p>
      {/* The mini demo is decoration; the heading and text carry the meaning. */}
      <div className="mt-auto pt-3.5" aria-hidden="true">
        {children}
      </div>
    </GlassCard>
  );
}

/** "Built to scale with Shopify Plus": a bento of glass tiles, each with its own small looping demo. */
export function ShopifyPlus() {
  const { checkout, functions, b2b, markets, flow, launchpad } = copy;

  return (
    <section id="shopify-plus" className={sectionClass}>
      <div className="wrap">
        <Pill>{copy.pill}</Pill>
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <p className={leadClass}>{copy.lead}</p>

        <SectionReveal className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-6" stagger={0.1} distance={80}>
          <Tile span={4} title={checkout.title} text={checkout.text}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span>{checkout.item[0]}</span>
                <span>{checkout.item[1]}</span>
              </div>
              <div className={clsx(styles.row, styles.upsell)}>
                <span>{checkout.upsell[0]}</span>
                <b>{checkout.upsell[1]}</b>
              </div>
              <div className={styles.row}>
                <span>{checkout.total[0]}</span>
                <span>{checkout.total[1]}</span>
              </div>
            </div>
          </Tile>

          <Tile span={2} title={functions.title} text={functions.text}>
            <span className={styles.code}>
              <em>{functions.code[0]}</em> {functions.code[1]}
            </span>
          </Tile>

          <Tile span={2} title={b2b.title} text={b2b.text}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span>{b2b.row[0]}</span>
                <span>{b2b.row[1]}</span>
              </div>
            </div>
          </Tile>

          <Tile span={2} title={markets.title} text={markets.text}>
            <div className={styles.ticker}>
              <span>
                {[...markets.currencies, markets.currencies[0]].map((currency, index) => (
                  <span key={index}>{currency}</span>
                ))}
              </span>
            </div>
          </Tile>

          <Tile span={2} title={flow.title} text={flow.text}>
            <svg className={styles.flow} width="220" height="40" viewBox="0 0 220 40">
              <path d="M20 20H200" style={{ stroke: "var(--fg-2)" }} strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="12" fill="#8A7CFF" />
              <circle cx="110" cy="20" r="12" fill="#FFB547" />
              <circle cx="200" cy="20" r="12" fill="#8EE3C8" />
            </svg>
          </Tile>

          <Tile span={6} title={launchpad.title} text={launchpad.text}>
            <div className={styles.launch}>
              {launchpad.steps.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </Tile>
        </SectionReveal>
      </div>
    </section>
  );
}
