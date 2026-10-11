/*
 * Software home. The hero below and the section stubs are placeholders until
 * phases 6 to 8 build the real sections; the contact section is final.
 */

import type { Metadata } from "next";
import { ModeSwitchLink } from "@/components/layout/ModeSwitchLink";
import { Contact } from "@/components/sections/shared/Contact";
import { SectionStub } from "@/components/sections/shared/SectionStub";

export const metadata: Metadata = {
  title: { absolute: "Arslan Mahtab, full stack software engineer" },
  description:
    "I build SaaS products, web apps and AI-powered tools end to end, from the database and APIs to a fast, polished front end.",
};

export default function SoftwareHome() {
  return (
    <>
      <section className="wrap flex min-h-svh flex-col justify-center pt-28 pb-20">
        <p className="mb-5 font-semibold text-fg-2">Arslan Mahtab, full stack software engineer</p>
        <h1 className="mb-8 max-w-[10em] text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.92] font-extrabold tracking-tighter">
          Full stack &amp; AI apps for <span className="serif-accent text-violet">SaaS products.</span>
        </h1>
        <p className="max-w-[30em] text-xl text-fg-2">
          I build SaaS products, web apps and AI-powered tools end to end, from the database and
          APIs to a fast, polished front end.
        </p>
        <ModeSwitchLink from="software" />
      </section>

      <SectionStub id="reception" title="Reception" phase={6} cursor="Open" />
      <SectionStub id="about" title="Clean code. Calm delivery." phase={7} cursor="Say hi" />
      <SectionStub id="stack" title="One engineer, the whole stack" phase={7} />
      <SectionStub id="build" title="What I build" phase={7} />
      <SectionStub id="ai" title="AI apps, end to end" phase={7} />
      <SectionStub id="saas" title="Next.js SaaS, idea to launch" phase={7} />
      <SectionStub id="projects" title="Software projects" phase={7} />

      <Contact mode="software" />
    </>
  );
}
