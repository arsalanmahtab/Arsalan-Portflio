/*
 * Software home. The hero below and the section stubs are placeholders until
 * phases 6 to 8 build the real sections; the contact section is final.
 */

import type { Metadata } from "next";
import { ModeSwitchLink } from "@/components/layout/ModeSwitchLink";
import { Contact } from "@/components/sections/shared/Contact";
import { SectionStub } from "@/components/sections/shared/SectionStub";
import { SplitText } from "@/components/ui/SplitText";

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
        <SplitText
          as="h1"
          lines={["Full stack", "& AI apps for", { accent: "SaaS products." }]}
          lineClassNames={[undefined, undefined, "text-violet"]}
          className="mb-8 text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.92] font-extrabold tracking-tighter"
        />
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
