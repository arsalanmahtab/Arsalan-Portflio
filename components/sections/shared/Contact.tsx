import type { Mode } from "@/config/modes";
import { contactIsPlaceholder, site } from "@/config/site";
import { contactByMode, contactLabels } from "@/data/contact";
import { ClosingLine } from "@/components/sections/shared/ClosingLine";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

/** Closing line and contact buttons at the end of each home. The footer robot joins in phase 8. */
export function Contact({ mode }: { mode: Mode }) {
  const copy = contactByMode[mode];
  const email = `mailto:${site.email}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(copy.message)}`;
  const whatsapp = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(copy.message)}`;

  return (
    <section id="contact" className="border-t border-line pt-[clamp(90px,12vw,170px)]">
      <div className="wrap">
        <ClosingLine {...copy.closing} />
        <div className="mb-20 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <AnimatedButton href={email} variant="primary">
              {contactLabels.email}
            </AnimatedButton>
            <AnimatedButton href={whatsapp} external>
              {contactLabels.whatsapp}
            </AnimatedButton>
            <AnimatedButton href={site.linkedin} external>
              {contactLabels.linkedin}
            </AnimatedButton>
          </div>
          {contactIsPlaceholder && (
            <p className="text-sm text-fg-2">
              <span className="ph">{contactLabels.placeholderNote}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
