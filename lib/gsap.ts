import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * The one place GSAP plugins are registered. Always import gsap, its plugins
 * and useGSAP from "@/lib/gsap" (ESLint enforces this) so registration has
 * happened before any animation runs.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);
}

export { Flip, gsap, ScrollTrigger, useGSAP };
