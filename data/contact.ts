import type { Mode } from "@/config/modes";

/** Contact section and footer copy. Email, WhatsApp and LinkedIn addresses live in config/site.ts. */

type ContactCopy = {
  /** Big closing line: "{lead}" on the first line, "{before} {accent}" on the second. */
  closing: { lead: string; before: string; accent: string };
  emailSubject: string;
  /** Prefilled text for email and WhatsApp. */
  message: string;
  /** Right-hand side of the footer line. */
  footerNote: string;
};

export const contactByMode: Record<Mode, ContactCopy> = {
  shop: {
    closing: { lead: "Let's build", before: "your", accent: "store." },
    emailSubject: "Shopify project",
    message: "Hi Arslan, I'd like to talk about a Shopify project.",
    footerNote: "Working with store owners worldwide",
  },
  software: {
    closing: { lead: "Let's build", before: "your", accent: "product." },
    emailSubject: "Software project",
    message: "Hi Arslan, I'd like to talk about a software project.",
    footerNote: "Working with founders and businesses worldwide",
  },
};

export const contactLabels = {
  email: "Email me",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  placeholderNote: "[Placeholder: set your email and WhatsApp number in config/site.ts]",
  availability: "Available for new projects",
  timePlace: "Pakistan",
  backToTop: "Back to top",
  backToTopRing: "BACK TO TOP · BACK TO TOP · BACK TO TOP ·",
  footerName: "Arslan Mahtab, software engineer and Shopify developer",
  skipLink: "Skip to content",
  startProject: "Start a project",
};
