import clsx from "clsx";
import { plans } from "@/data/pricing";
import { pricingSection as copy } from "@/data/shopify";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { isPlaceholder, MaybePlaceholder } from "@/components/ui/MaybePlaceholder";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { leadClass, sectionClass, sectionTitleClass } from "@/lib/styles";
import styles from "./Pricing.module.css";

/** "Simple, clear pricing": three plans; the middle one is raised with a turning border. */
export function Pricing() {
  return (
    <section id="pricing" className={sectionClass}>
      <div className="wrap">
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <p className={leadClass}>{copy.lead}</p>

        <SectionReveal
          className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] items-stretch gap-5"
          stagger={0.14}
          distance={100}
        >
          {plans.map((plan) => (
            <GlassCard
              key={plan.name}
              as="article"
              radius={26}
              className={clsx("flex flex-col gap-3.5 px-6.5 py-8", plan.featured && styles.featured)}
            >
              {plan.featured && (
                <span className="self-start rounded-full bg-lime px-3 py-1.25 text-[0.78rem] font-extrabold text-on-lime">
                  {copy.popular}
                </span>
              )}
              <h3 className="text-2xl">{plan.name}</h3>
              <p className="m-0 text-fg-2">{plan.description}</p>
              {/* A real price shows large; the wide "[YOUR PRICE]" placeholder smaller, so it stays on one line. */}
              <p
                className={clsx(
                  "m-0 font-display leading-none font-extrabold tracking-[-0.03em]",
                  isPlaceholder(plan.price) ? "text-[1.35rem]" : "text-[2.2rem]",
                )}
              >
                <MaybePlaceholder text={plan.price} />
                <small className="mt-1.5 block font-sans text-[0.85rem] font-semibold tracking-normal text-fg-2">
                  {plan.priceNote}
                </small>
              </p>
              <ul className="mt-2 mb-4.5 grid list-none gap-2.5 p-0">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Icon name="check" size={16} strokeWidth={3} className="mt-1 flex-none text-lime-text" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <AnimatedButton href={plan.cta.href} variant={plan.featured ? "primary" : "secondary"}>
                  {plan.cta.label}
                </AnimatedButton>
              </div>
            </GlassCard>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
