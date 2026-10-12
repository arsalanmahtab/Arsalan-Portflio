/*
 * Software home, in the section order of PROMPT.md section 9. The 3D developer
 * android joins the About section in phase 8.
 */

import type { Metadata } from "next";
import { Contact } from "@/components/sections/shared/Contact";
import { ReceptionLobby } from "@/components/sections/shared/ReceptionLobby";
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
      <ReceptionLobby set="software" />
      <About />
      <Stack />
      <WhatIBuild />
      <AiPipeline />
      <SaasLaunch />
      <SoftwareProjects />
      <Contact mode="software" />
    </>
  );
}
