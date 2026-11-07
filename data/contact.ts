import type { Mode } from "@/config/modes";

/** Contact section and footer copy. The email address and LinkedIn link live in config/site.ts. */

type ContactCopy = {
  /** Big closing line: "{lead}" on the first line, "{before} {accent}" on the second. */
  closing: { lead: string; before: string; accent: string };
  emailSubject: string;
  /** Prefilled text for the Email me button. */
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

/** The robot that visits the contact section. */
export const footerRobot = {
  bubble: "Thanks for visiting! Let's talk.",
  replay: "Bring the robot back",
};

/** The contact form. Messages are emailed to the address in config/site.ts. */
export const contactForm = {
  title: "Send me a message",
  intro: "Tell me a little about your project and I'll get back to you.",
  fields: {
    firstName: { label: "First name", autoComplete: "given-name" },
    lastName: { label: "Last name", autoComplete: "family-name" },
    email: { label: "Email", autoComplete: "email", placeholder: "you@company.com" },
    phone: { label: "Phone number", autoComplete: "tel", placeholder: "+92 300 0000000" },
    message: { label: "Message", placeholder: "What are you building, and when would you like to launch?" },
  },
  optional: "optional",
  send: "Send message",
  sending: "Sending…",
  sent: "Thanks, {name}! Your message is on its way. I'll get back to you soon.",
  invalid: "Please check the highlighted fields.",
  tooMany: "That's a lot of messages in a short time. Please try again in a few minutes, or email me directly.",
  /** When the message couldn't be sent from the site: the visitor can email it instead. */
  fallback: "Sorry, your message couldn't be sent from here right now. You can email it to me instead:",
  fallbackLink: "Email this message",
  errors: {
    firstName: "Please enter your first name.",
    lastName: "Please enter your last name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number, or leave it empty.",
    message: "Please write a message of at least 10 characters.",
    tooLong: "That's a bit long. Please shorten it.",
  },
  direct: {
    title: "Prefer email or LinkedIn?",
    text: "Write to me directly, or connect with me on LinkedIn.",
    emailLabel: "Email",
    linkedinLabel: "LinkedIn",
  },
};

export const contactLabels = {
  email: "Email me",
  linkedin: "LinkedIn",
  placeholderNote: "[Placeholder: set your email address in config/site.ts]",
  availability: "Available for new projects",
  timePlace: "Pakistan",
  backToTop: "Back to top",
  backToTopRing: "BACK TO TOP · BACK TO TOP · BACK TO TOP ·",
  footerName: "Arslan Mahtab, software engineer and Shopify developer",
  skipLink: "Skip to content",
  startProject: "Start a project",
};
