/*
 * TEMPORARY: shows the phase 3 UI kit on the Shopify home so every piece can
 * be checked in place. Remove when phase 4 builds the real sections.
 */

import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Highlight } from "@/components/ui/Highlight";
import { Pill } from "@/components/ui/Pill";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";

export function UiKitPreview() {
  return (
    <section id="ui-kit" className="border-t border-line py-[clamp(80px,11vw,150px)]">
      <div className="wrap">
        <Pill>UI kit preview</Pill>
        <SplitText
          reveal
          lines={["Every piece,", ["in ", { accent: "motion." }]]}
          className="mb-8 text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[0.95] font-extrabold"
        />
        <SectionReveal className="grid gap-10">
          <p className="max-w-[34em] text-lg text-fg-2">
            Hover the buttons: the fill grows from where the pointer enters, the label rolls and the
            arrow swaps. Click for the ripple. On desktop they lean toward the cursor.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <AnimatedButton href="#contact" variant="primary">
              Start a project
            </AnimatedButton>
            <AnimatedButton href="#work">See my work</AnimatedButton>
            <AnimatedButton variant="primary" size="sm">
              Replay demo
            </AnimatedButton>
            <AnimatedButton size="sm" magnetic={false}>
              Back to reception
            </AnimatedButton>
          </div>
          <p className="font-display text-[clamp(1.05rem,2vw,1.3rem)] tracking-[-0.01em]">
            <Highlight>Rank your website in ChatGPT, Claude &amp; AI tools</Highlight>
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard as="article" className="flex flex-col gap-2.5 p-6">
              <h3 className="text-[1.35rem] leading-tight">Glass card</h3>
              <p className="text-fg-2">Translucent fill, blur, a fine edge and a light sheen on hover.</p>
            </GlassCard>
            <GlassCard as="article" radius={28} className="flex flex-col gap-2.5 p-6">
              <h3 className="text-[1.35rem] leading-tight">Rounder corners</h3>
              <p className="text-fg-2">Radius is a prop, so panels, chips and dialogs share one component.</p>
            </GlassCard>
            <div className="flex flex-col items-start gap-4 rounded-[22px] bg-violet p-6 text-on-violet">
              <h3 className="text-[1.8rem] leading-none">Your store could be next.</h3>
              <AnimatedButton href="#contact" variant="onViolet">
                Start a project
              </AnimatedButton>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
