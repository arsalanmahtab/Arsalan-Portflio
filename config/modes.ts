/**
 * The two home pages ("modes"): the Shopify portfolio and the software engineering portfolio.
 * Navbar links, toggle labels and the page-switch overlay all read from here.
 */

export type Mode = "shop" | "software";

export type ModeConfig = {
  path: string;
  /** Label in the navbar toggle. */
  toggleLabel: string;
  /** Big title on the page-switch overlay when switching to this portfolio. */
  switchTitle: string;
  /** Navbar section links, in page order. Each id must match a section id on the page. */
  sections: readonly { id: string; label: string }[];
  /** The pill in this page's hero that links to the other portfolio. */
  crossLink: { lead: string; action: string };
};

export const modes: Record<Mode, ModeConfig> = {
  shop: {
    path: "/",
    toggleLabel: "Shopify",
    switchTitle: "Shopify portfolio",
    sections: [
      { id: "reception", label: "Reception" },
      { id: "work", label: "Work" },
      { id: "ai-ranking", label: "AI ranking" },
      { id: "shopify-plus", label: "Shopify Plus" },
      { id: "services", label: "Services" },
      { id: "pricing", label: "Pricing" },
    ],
    crossLink: { lead: "Hiring a software engineer?", action: "See my full stack work" },
  },
  software: {
    path: "/software",
    toggleLabel: "Software",
    switchTitle: "Software engineering",
    sections: [
      { id: "reception", label: "Reception" },
      { id: "about", label: "About" },
      { id: "stack", label: "Stack" },
      { id: "build", label: "Build" },
      { id: "ai", label: "AI" },
      { id: "saas", label: "SaaS" },
      { id: "projects", label: "Projects" },
    ],
    crossLink: { lead: "Need a Shopify store?", action: "See my Shopify portfolio" },
  },
};

/** Small line above the title on the page-switch overlay. */
export const switchLead = "Switching to";

export const modeOrder: readonly Mode[] = ["shop", "software"];

export function modeFromPath(pathname: string): Mode {
  return pathname === "/software" || pathname.startsWith("/software/") ? "software" : "shop";
}

export function otherMode(mode: Mode): Mode {
  return mode === "shop" ? "software" : "shop";
}
