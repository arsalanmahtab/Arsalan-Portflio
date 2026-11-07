import { workMapSection as copy } from "@/data/workMap";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { leadClass, sectionClass } from "@/lib/styles";
import { WorkMapGraph } from "./WorkMapGraph";

/**
 * "Everything I build, mapped": every area I work in as an interactive map,
 * right after the hero on both homes. Larger than a standard section; each
 * chapter of the page then opens with this map zoomed in on one area
 * (ChapterOpener).
 */
export function WorkMap() {
  return (
    <section id="map" className={sectionClass}>
      <div className="wrap">
        <Pill>{copy.pill}</Pill>
        <SplitText
          reveal
          lines={copy.title}
          className="mb-5.5 text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.94] font-extrabold tracking-[-0.045em]"
        />
        <p className={leadClass}>{copy.lead}</p>
      </div>
      <SectionReveal distance={60} className="mx-auto max-w-[1760px] px-[clamp(10px,1.6vw,28px)]">
        <WorkMapGraph />
      </SectionReveal>
    </section>
  );
}
