/*
 * Shopify home, in the section order of PROMPT.md section 8. The developer
 * desk scene joins in phase 9.
 */

import { Contact } from "@/components/sections/shared/Contact";
import { ReceptionLobby } from "@/components/sections/shared/ReceptionLobby";
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
      <ReceptionLobby set="shop" />
      <SkillsMarquee />
      <AiRanking />
      <CodeToCheckout />
      <FeaturedWork />
      <AllStores />
      <ShopifyPlus />
      <AiAssistant />
      <VoiceAssistant />
      <WebSaas />
      <Services />
      <Pricing />
      <Faq />
      <Contact mode="shop" />
    </>
  );
}
