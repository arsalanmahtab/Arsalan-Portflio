import type { Mode } from "@/config/modes";
import { contactIsPlaceholder, site } from "@/config/site";
import { contactByMode, contactForm, contactLabels } from "@/data/contact";
import { ClosingLine } from "@/components/sections/shared/ClosingLine";
import { ContactForm } from "@/components/sections/shared/ContactForm";
import { FooterRobot } from "@/components/sections/shared/FooterRobot";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SectionReveal } from "@/components/ui/SectionReveal";

/** Closing line, the contact form, direct email and LinkedIn, and the visiting robot at the end of each home. */
export function Contact({ mode }: { mode: Mode }) {
  const copy = contactByMode[mode];
  const { direct } = contactForm;
  const email = `mailto:${site.email}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(copy.message)}`;
  const linkedinShort = site.linkedin.replace(/^https?:\/\/(www\.)?/, "");

  return (
    <section id="contact" className="border-t border-line pt-[clamp(64px,7.5vw,112px)]">
      <div className="wrap">
        <ClosingLine {...copy.closing} />

        <SectionReveal className="mb-8 grid items-start gap-10 min-[960px]:grid-cols-[1.4fr_0.6fr]" stagger={0.12}>
          <ContactForm mode={mode} />

          <div className="flex flex-col gap-4 min-[960px]:pt-6.5">
            <h3 className="text-[1.4rem] leading-tight">{direct.title}</h3>
            <p className="m-0 text-fg-2">{direct.text}</p>
            <dl className="m-0 grid gap-3">
              <div>
                <dt className="text-[0.85rem] font-semibold text-fg-2">{direct.emailLabel}</dt>
                <dd className="m-0">
                  <a href={`mailto:${site.email}`} className="font-bold break-all underline-offset-4 hover:underline">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.85rem] font-semibold text-fg-2">{direct.linkedinLabel}</dt>
                <dd className="m-0">
                  <a
                    href={site.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold break-all underline-offset-4 hover:underline"
                  >
                    {linkedinShort}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-1 flex flex-wrap gap-3">
              <AnimatedButton href={email}>{contactLabels.email}</AnimatedButton>
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
        </SectionReveal>

        <FooterRobot />
      </div>
    </section>
  );
}
