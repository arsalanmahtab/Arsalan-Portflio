import type { IconName } from "@/components/ui/Icon";
import type { Mode } from "@/config/modes";

/**
 * The reception lobby (PROMPT.md section 7), shown right after the hero on both
 * homes: the story's lines, the service menu and each service's detail dialog.
 */

export type LobbyService = {
  icon: IconName;
  title: string;
  /** One line on the menu card. */
  summary: string;
  /** Shown in the dialog that opens from the card. */
  description: string;
  included: readonly string[];
};

export const lobbyServices: Record<Mode, readonly LobbyService[]> = {
  shop: [
    {
      icon: "bag",
      title: "New Shopify store",
      summary: "A store that sells from day one.",
      description:
        "A complete Shopify store designed around your brand, set up with payments, shipping and everything you need to start selling.",
      included: ["Custom design", "Payments and shipping", "Mobile-first pages", "Launch support"],
    },
    {
      icon: "code",
      title: "Custom theme",
      summary: "Sections your team can edit.",
      description:
        "A custom Shopify theme built with clean Liquid and flexible sections, so you can change pages without calling a developer.",
      included: ["Online Store 2.0 sections", "Fast, clean code", "Theme editor ready", "Handover walkthrough"],
    },
    {
      icon: "bolt",
      title: "Speed and conversion",
      summary: "Faster pages, more sales.",
      description:
        "I find what slows your store down and what stops shoppers from buying, then fix it and show you the before and after.",
      included: ["Speed audit", "Image and app cleanup", "Checkout improvements", "Before and after report"],
    },
    {
      icon: "chat",
      title: "Rank in ChatGPT and Claude",
      summary: "Get recommended by AI.",
      description:
        "I optimize your store so AI tools like ChatGPT, Claude and Perplexity understand your products and can recommend your brand.",
      included: ["Structured product data", "AI-friendly FAQs", "llms.txt file", "Trust signals"],
    },
    {
      icon: "layers",
      title: "Shopify Plus",
      summary: "Built for high-volume brands.",
      description:
        "Checkout Extensibility, Shopify Functions, B2B and Markets, set up for brands that need more than a standard store.",
      included: ["Checkout customisation", "Custom discount rules", "B2B and wholesale", "International selling"],
    },
    {
      icon: "move",
      title: "Store migration",
      summary: "Move to Shopify safely.",
      description:
        "Move from WordPress, WooCommerce, Wix, Squarespace or Magento to Shopify while keeping your products, customers and SEO.",
      included: ["Products and customers", "Order history", "SEO redirects", "Launch checklist"],
    },
  ],
  software: [
    {
      icon: "cloud",
      title: "Next.js SaaS product",
      summary: "From idea to paying users.",
      description:
        "A complete SaaS product with sign-up, subscriptions, dashboards and an admin area, built with Next.js.",
      included: ["Auth and teams", "Subscriptions and billing", "Dashboards", "Deployment"],
    },
    {
      icon: "app",
      title: "Full stack web app",
      summary: "React front end, Laravel back end.",
      description:
        "Custom web apps, portals and internal tools with a React or Next.js front end and a Laravel or Node.js back end.",
      included: ["React or Next.js", "Laravel or Node.js APIs", "MySQL database", "Admin panel"],
    },
    {
      icon: "spark",
      title: "AI app or agent",
      summary: "AI that works on your data.",
      description:
        "Chatbots, AI agents and RAG search that answer from your own documents and connect to the tools you already use.",
      included: ["LLM integration", "RAG search", "AI agents and tools", "Chat interface"],
    },
    {
      icon: "plug",
      title: "APIs and integrations",
      summary: "Connect everything.",
      description: "REST APIs, payment gateways, webhooks and third-party integrations, documented and tested.",
      included: ["REST APIs", "Payments", "Webhooks", "Documentation"],
    },
    {
      icon: "wp",
      title: "WordPress website",
      summary: "Fast and easy to update.",
      description:
        "Custom WordPress websites and WooCommerce stores that load fast and are simple for your team to manage.",
      included: ["Custom theme", "WooCommerce", "Speed optimisation", "Easy editing"],
    },
    {
      icon: "move",
      title: "Website migration",
      summary: "Change platforms safely.",
      description:
        "Move your website between platforms, like WordPress to Next.js or WooCommerce to Shopify, without losing content or SEO.",
      included: ["Content and data", "SEO redirects", "Testing", "Launch checklist"],
    },
  ],
};

export const lobbyCopy = {
  pill: "Welcome in",
  title: ["Step inside.", { accent: "Reception will help." }] as const,
  lead: "Watch the visit: the guard opens the gate, reception greets you, and you choose the service you need. Tap any service to see the details.",
  sceneLabel:
    "Animated lobby: a visitor walks in, the guard opens the gate, and the receptionist offers services",
  /** Words painted in the scene. */
  signs: { gate: "WELCOME", wall: "Reception", desk: "ARSLAN STUDIO" },
  /** Speech bubbles, in story order. */
  lines: {
    guardWelcome: "Welcome! Let me open the gate.",
    guardDirections: "Reception is straight ahead.",
    greeting: "Hi! Which service can I help you with?",
    reply: "Let me take a look.",
    choice: "Great choice! Here are the details.",
  },
  /** Who is speaking, for screen readers. */
  speakers: { guard: "Guard", receptionist: "Receptionist", customer: "Visitor" },
  ask: "Which service do you need?",
  replay: "Replay the visit",
  dialog: {
    start: "Start this project",
    back: "Back to reception",
    close: "Close",
    included: "What's included",
  },
};
