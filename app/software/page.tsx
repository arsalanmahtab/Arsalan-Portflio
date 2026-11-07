/*
 * Software home, in the section order of PROMPT.md section 9. The 3D developer
 * android joins the About section in phase 8. Each ChapterOpener introduces the
 * section after it with the work map zoomed in on that area.
 */

import type { Metadata } from "next";
import { ChapterOpener } from "@/components/sections/shared/ChapterOpener";
import { Contact } from "@/components/sections/shared/Contact";
import { ReceptionLobby } from "@/components/sections/shared/ReceptionLobby";
import { WorkMap } from "@/components/sections/shared/WorkMap";
import { About } from "@/components/sections/software/About";
import { AiPipeline } from "@/components/sections/software/AiPipeline";
import { SaasLaunch } from "@/components/sections/software/SaasLaunch";
import { SoftwareHero } from "@/components/sections/software/SoftwareHero";
import { SoftwareProjects } from "@/components/sections/software/SoftwareProjects";
import { Stack } from "@/components/sections/software/Stack";
import { WhatIBuild } from "@/components/sections/software/WhatIBuild";

export const metadata: Metadata = {
  title: { absolute: "Arslan Mahtab, full stack software engineer" },
  description:
    "I build SaaS products, web apps and AI-powered tools end to end, from the database and APIs to a fast, polished front end.",
};

export default function SoftwareHome() {
  return (
    <>
      <SoftwareHero />
      <WorkMap />
      <ReceptionLobby set="software" />
      <About />
      <ChapterOpener area="frontend" />
      <Stack />
      <ChapterOpener area="backend" />
      <WhatIBuild />
      <ChapterOpener area="ai" />
      <AiPipeline />
      <ChapterOpener area="saas" />
      <SaasLaunch />
      <SoftwareProjects />
      <Contact mode="software" />
    </>
  );
}
