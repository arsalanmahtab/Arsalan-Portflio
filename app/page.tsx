/*
 * Shopify home, in the section order of PROMPT.md section 8. Stubs mark the
 * sections later phases build (lobby in 6, Plus to FAQ in 5, desk scene in 9).
 */

import { Contact } from "@/components/sections/shared/Contact";
import { SectionStub } from "@/components/sections/shared/SectionStub";
import { AiRanking } from "@/components/sections/shopify/AiRanking";
import { AllStores } from "@/components/sections/shopify/AllStores";
import { CodeToCheckout } from "@/components/sections/shopify/CodeToCheckout";
import { FeaturedWork } from "@/components/sections/shopify/FeaturedWork";
import { Hero } from "@/components/sections/shopify/Hero";
import { SkillsMarquee } from "@/components/sections/shopify/SkillsMarquee";

export default function ShopifyHome() {
  return (
    <>
      <Hero />
      <SectionStub id="reception" title="Reception" phase={6} cursor="Open" />
      <SkillsMarquee />
      <AiRanking />
      <CodeToCheckout />
      <FeaturedWork />
      <AllStores />
      <SectionStub id="shopify-plus" title="Shopify Plus" phase={5} />
      <SectionStub id="services" title="Services" phase={5} />
      <SectionStub id="pricing" title="Pricing" phase={5} />
      <Contact mode="shop" />
    </>
  );
}
