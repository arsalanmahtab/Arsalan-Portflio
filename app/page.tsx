/*
 * Shopify home, in the section order of PROMPT.md section 8. The developer
 * desk scene joins in phase 9. Each ChapterOpener introduces the section after
 * it with the work map zoomed in on that area.
 */

import { ChapterOpener } from "@/components/sections/shared/ChapterOpener";
import { Contact } from "@/components/sections/shared/Contact";
import { ReceptionLobby } from "@/components/sections/shared/ReceptionLobby";
import { WorkMap } from "@/components/sections/shared/WorkMap";
import { AiAssistant } from "@/components/sections/shopify/AiAssistant";
import { AiRanking } from "@/components/sections/shopify/AiRanking";
import { AllStores } from "@/components/sections/shopify/AllStores";
import { CodeToCheckout } from "@/components/sections/shopify/CodeToCheckout";
import { Faq } from "@/components/sections/shopify/Faq";
import { FeaturedWork } from "@/components/sections/shopify/FeaturedWork";
import { Hero } from "@/components/sections/shopify/Hero";
import { Pricing } from "@/components/sections/shopify/Pricing";
import { Services } from "@/components/sections/shopify/Services";
import { ShopifyPlus } from "@/components/sections/shopify/ShopifyPlus";
import { SkillsMarquee } from "@/components/sections/shopify/SkillsMarquee";
import { VoiceAssistant } from "@/components/sections/shopify/VoiceAssistant";
import { WebSaas } from "@/components/sections/shopify/WebSaas";

export default function ShopifyHome() {
  return (
    <>
      <Hero />
      <WorkMap />
      <ReceptionLobby set="shop" />
      <SkillsMarquee />
      <ChapterOpener area="ai-search" />
      <AiRanking />
      <ChapterOpener area="themes" />
      <CodeToCheckout />
      <ChapterOpener area="stores" />
      <FeaturedWork />
      <AllStores />
      <ChapterOpener area="plus" />
      <ShopifyPlus />
      <ChapterOpener area="ai" />
      <AiAssistant />
      <VoiceAssistant />
      <ChapterOpener area="web" />
      <WebSaas />
      <Services />
      <Pricing />
      <Faq />
      <Contact mode="shop" />
    </>
  );
}
