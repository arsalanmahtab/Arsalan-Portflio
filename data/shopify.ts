/**
 * Copy for the Shopify home (/), section by section.
 * Sections from phase 5 onward add their own entries here.
 */

import type { IconName } from "@/components/ui/Icon";

export const shopifyHero = {
  kicker: "Arslan Mahtab, software engineer and senior Shopify developer",
  /** The first lines of the headline; the last line cycles through `rotatingWords`. */
  titleLines: ["Shopify stores", "built for"],
  rotatingWords: ["the AI era.", "SaaS brands.", "mobile shoppers.", "fast checkout.", "more sales."],
  highlight: "Rank your website in ChatGPT, Claude & AI tools",
  subtitle:
    "Shopify stores, SaaS websites and WordPress builds, plus migrations from any platform. Fast, modern and ready for AI search.",
  primaryCta: { label: "See my work", href: "#work" },
  secondaryCta: { label: "Start a project", href: "#contact" },
  scrollHint: "Scroll",
  /**
   * Floating notification chips. Desktop positions are percentages (left, top)
   * of the hero; mobile positions are percentages of the space under the copy.
   * `depth` is how far the chip follows the mouse (negative moves the other way).
   * Chips without a mobile position only show on wide screens.
   */
  chips: [
    { title: "Added to cart", detail: "Linen tote, $52", icon: "bag", color: "#FFB547", depth: 40, desktop: [56, 20], mobile: [4, 6] },
    { title: "New order", detail: "#1042 confirmed", icon: "check", color: "#8A7CFF", depth: -30, desktop: [81, 14], mobile: [52, 28] },
    { title: "AI search", detail: "“summer dresses”", icon: "spark", color: "#FF9DBB", depth: 55, desktop: [54, 72], mobile: [6, 56] },
    { title: "5-star review", detail: "“Love this store!”", icon: "star", color: "#FFB547", depth: -45, desktop: [83, 62] },
    { title: "Checkout complete", detail: "Paid in 9 seconds", icon: "card", color: "#8EE3C8", depth: 25, desktop: [68, 86] },
  ] satisfies {
    title: string;
    detail: string;
    icon: IconName;
    color: string;
    depth: number;
    desktop: [number, number];
    mobile?: [number, number];
  }[],
};

export const aiRanking = {
  pill: "AI search optimization",
  /** The middle line sits in the lime highlight box. */
  title: ["Rank your website in", "ChatGPT, Claude", "& AI tools."],
  /** **double asterisks** mark the bold phrases. */
  lead: "Shoppers now ask AI what to buy. I optimize your Shopify store so **ChatGPT, Claude, Gemini and Perplexity** understand your products and **recommend your brand** in their answers.",
  tools: [
    { name: "ChatGPT", color: "#10A37F" },
    { name: "Claude", color: "#D97757" },
    { name: "Gemini", color: "#4C8DF6" },
    { name: "Perplexity", color: "#20B8CD" },
    { name: "Google AI Overviews", color: "#C6F24E" },
  ],
  steps: [
    { title: "AI-readable product data", text: "Structured data so AI tools know exactly what you sell." },
    { title: "Answers AI loves to quote", text: "Clear FAQs, comparisons and buying guides on your store." },
    { title: "Trust signals and llms.txt", text: "Reviews, brand mentions and an AI guide file for your site." },
  ],
  chat: {
    name: "AI assistant",
    caption: "Shopper asks for a recommendation",
    question: "Where can I buy organic skincare online in the UK?",
    answer: "Here are the best options I found:",
    /** The last entry is the optimised store; it climbs to the top. */
    results: [
      { name: "glowbox.co.uk", note: "Good range, slow delivery" },
      { name: "purelyskin.com", note: "Popular but pricey" },
      { name: "herbnest.co.uk", note: "Small range" },
      { name: "yourstore.com", note: "Organic, fast UK delivery, great reviews" },
    ],
    badge: "Recommended by AI",
    replay: "Replay",
    note: "Illustration of how an optimized store can appear in AI answers.",
  },
};

export const codeToCheckout = {
  title: ["From code", ["to ", { accent: "checkout." }]] as const,
  steps: [
    { title: "Write the theme", text: "Clean Liquid and JavaScript, built to load fast." },
    { title: "Design the layout", text: "Pages shaped around how your customers shop." },
    { title: "Launch and sell", text: "Your store goes live and the orders start coming in." },
  ],
  code: [
    "{% for product in collection.products %}",
    '  <div class="card">',
    "    {{ product.featured_image | image_tag }}",
    "    <h3>{{ product.title }}</h3>",
    "    <span>{{ product.price | money }}</span>",
    "    {% form 'product', product %}",
    "      <button>Add to cart</button>",
    "    {% endform %}",
    "  </div>",
    "{% endfor %}",
  ],
  store: {
    url: "yourstore.com",
    bag: "Bag",
    name: "Your store",
    banner: "New season is here",
    bannerNote: "Free shipping over $50",
    addToCart: "Add to cart",
    products: [
      { name: "Serum", price: "$32", tint: "#E8E4FF" },
      { name: "Tote", price: "$52", tint: "#FFF1D9" },
      { name: "Mug", price: "$18", tint: "#E3F0FF" },
    ],
    toast: "New order #1001 for $84.00",
  },
  demoLabel: "Animated demo: Liquid theme code turns into a live store that takes an order.",
};

export const featuredSection = {
  title: ["Selected ", { accent: "work" }] as const,
  intro: "Two featured builds.",
  allStoresLink: "See all stores",
  builtLabel: "What I built",
  resultLabel: "Result",
  visitLabel: "Visit the store",
  next: { title: ["Your store", "could be next."], cta: "Start a project" },
};

export const storesSection = {
  /** "{count}+ stores", then the accent line. */
  countSuffix: "+ stores",
  accent: "designed and built.",
  lead: "Fashion, fitness, beauty, home, outdoor and more. Every one of these is a store I've designed or built. Swipe or drag through them, and tap the front card to visit it live.",
  sliderLabel: "Stores I've built. Use the left and right arrow keys to browse.",
  previous: "Previous store",
  next: "Next store",
};
