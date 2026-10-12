import { voiceAssistant as copy } from "@/data/shopify";
import { VoicePanel } from "@/components/sections/shopify/VoicePanel";
import { FeatureList } from "@/components/ui/FeatureList";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";

/** "Talk to my AI assistant": a working voice assistant that answers questions about the services. */
export function VoiceAssistant() {
  return (
    <section id="voice" className={sectionClass}>
      <div className="wrap grid items-center gap-12 min-[900px]:grid-cols-2">
        <div>
          <Pill>{copy.pill}</Pill>
          <SplitText reveal lines={copy.title} className={sectionTitleClass} />
          <p className="mb-7 max-w-[30em] text-[1.15rem] text-fg-2">{copy.lead}</p>
          <FeatureList items={copy.features} />
        </div>
        <SectionReveal distance={100}>
          <VoicePanel />
        </SectionReveal>
      </div>
    </section>
  );
}
