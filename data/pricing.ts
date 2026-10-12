/**
 * Pricing cards. PLACEHOLDER: replace "[YOUR PRICE]" with real starting prices;
 * text in [square brackets] shows highlighted on the site until you do.
 */

export type Plan = {
  name: string;
  description: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: { label: string; href: string };
  /** Raised card with the spinning border and the "Most popular" tag. */
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Starter",
    description: "For new brands launching their first store.",
    price: "[YOUR PRICE]",
    priceNote: "starting from",
    features: ["Theme setup and customisation", "Essential pages", "Payments and shipping setup", "Launch support"],
    cta: { label: "Get started", href: "#contact" },
  },
  {
    name: "Growth",
    description: "For brands ready to stand out and sell more.",
    price: "[YOUR PRICE]",
    priceNote: "starting from",
    features: [
      "Custom design and sections",
      "Speed optimisation",
      "AI search optimization for ChatGPT and Claude",
      "Support after launch",
    ],
    cta: { label: "Get started", href: "#contact" },
    featured: true,
  },
  {
    name: "Shopify Plus",
    description: "For high-volume brands that need more.",
    price: "Custom",
    priceNote: "quote after a call",
    features: ["Checkout Extensibility", "Shopify Functions", "B2B and Markets setup", "Priority support"],
    cta: { label: "Book a call", href: "#contact" },
  },
];
