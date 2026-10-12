import { webSection as copy } from "@/data/shopify";
import { MigrationDemo } from "@/components/sections/shopify/MigrationDemo";
import { GlassCard } from "@/components/ui/GlassCard";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { RichText } from "@/components/ui/RichText";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { leadClass, sectionClass, sectionTitleClass } from "@/lib/styles";

/** "More than a Shopify developer": SaaS, web apps and WordPress, plus a looping migration demo. */
export function WebSaas() {
  return (
    <section id="web" className={sectionClass}>
      <div className="wrap">
        <Pill>{copy.pill}</Pill>
        <SplitText reveal lines={copy.title} className={sectionTitleClass} />
        <p className={`${leadClass} [&_b]:text-fg`}>
          <RichText text={copy.lead} />
        </p>

        <SectionReveal className="mb-18 grid gap-4.5 md:grid-cols-3">
          {copy.cards.map((card) => (
            <GlassCard key={card.title} as="article" className="flex flex-col gap-3 p-6.5">
              <span className="grid size-11.5 place-items-center rounded-[13px] bg-lime text-on-lime">
                <Icon name={card.icon} />
              </span>
              <h3 className="mt-2 text-[1.35rem] leading-tight">{card.title}</h3>
              <p className="m-0 text-fg-2">{card.text}</p>
            </GlassCard>
          ))}
        </SectionReveal>

        <h3 className="mb-5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.1]">{copy.migration.title}</h3>
        <SectionReveal className="mb-7">
          <MigrationDemo />
        </SectionReveal>

        <SectionReveal as="ul" aria-label={copy.platformsLabel} className="m-0 flex list-none flex-wrap gap-2.5 p-0" stagger={0.05} distance={20}>
          {copy.platforms.map((platform) => (
            <li
              key={platform}
              className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-2.5 font-extrabold backdrop-blur-md"
            >
              <i aria-hidden="true" className="size-2.25 rounded-full bg-lime" />
              {platform}
            </li>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
