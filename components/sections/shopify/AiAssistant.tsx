import { aiAssistant as copy } from "@/data/shopify";
import { PhoneChat } from "@/components/sections/shopify/PhoneChat";
import { FeatureList } from "@/components/ui/FeatureList";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { sectionClass, sectionTitleClass } from "@/lib/styles";

/** "AI that helps shoppers buy": features on the left, a live phone chat demo on the right. */
export function AiAssistant() {
  return (
    <section id="ai-assistant" className={sectionClass}>
      <div className="wrap grid items-center gap-14 min-[900px]:grid-cols-2">
        <div>
          <SplitText reveal lines={copy.title} className={sectionTitleClass} />
          <p className="mb-7 max-w-[30em] text-[1.15rem] text-fg-2">{copy.lead}</p>
          <FeatureList items={copy.features} />
        </div>
        <SectionReveal distance={100}>
          <PhoneChat />
        </SectionReveal>
      </div>
    </section>
  );
}
