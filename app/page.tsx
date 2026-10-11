/*
 * Shopify home. The hero below, the UI kit preview and the section stubs are
 * placeholders until phases 4 to 9 build the real sections; the skills
 * marquee and the contact section are final.
 */

import { ModeSwitchLink } from "@/components/layout/ModeSwitchLink";
import { Contact } from "@/components/sections/shared/Contact";
import { SectionStub } from "@/components/sections/shared/SectionStub";
import { UiKitPreview } from "@/components/sections/shared/UiKitPreview";
import { SkillsMarquee } from "@/components/sections/shopify/SkillsMarquee";
import { SplitText } from "@/components/ui/SplitText";

export default function ShopifyHome() {
  return (
    <>
      <section className="wrap flex min-h-svh flex-col justify-center pt-28 pb-20">
        <p className="mb-5 font-semibold text-fg-2">
          Arslan Mahtab, software engineer and senior Shopify developer
        </p>
        <SplitText
          as="h1"
          lines={["Shopify stores", "built for", { accent: "the AI era." }]}
          lineClassNames={[undefined, undefined, "text-violet"]}
          className="mb-8 text-[clamp(3rem,9vw,8.4rem)] leading-[0.9] font-extrabold tracking-tighter"
        />
        <p className="max-w-[30em] text-xl text-fg-2">
          Shopify stores, SaaS websites and WordPress builds, plus migrations from any platform.
          Fast, modern and ready for AI search.
        </p>
        <ModeSwitchLink from="shop" />
      </section>

      <UiKitPreview />
      <SectionStub id="reception" title="Reception" phase={6} cursor="Open" />
      <SkillsMarquee />
      <SectionStub id="ai-ranking" title="AI ranking" phase={4} />
      <SectionStub id="work" title="Featured work" phase={4} cursor="Visit" />
      <SectionStub id="shopify-plus" title="Shopify Plus" phase={5} />
      <SectionStub id="services" title="Services" phase={5} />
      <SectionStub id="pricing" title="Pricing" phase={5} />

      <Contact mode="shop" />
    </>
  );
}
