import { servicesSection as copy } from "@/data/shopify";
import { ServicesGrid } from "@/components/sections/shopify/ServicesGrid";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass } from "@/lib/styles";

/** "What I can do for you": every service, filterable by category. */
export function Services() {
  return (
    <section id="services" className={sectionClass}>
      <div className="wrap">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <SplitText reveal lines={copy.title} className="text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[0.95] font-bold" />
          <p className="m-0 max-w-[24em] text-fg-2">{copy.intro}</p>
        </div>
        <ServicesGrid />
      </div>
    </section>
  );
}
