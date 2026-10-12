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

export const shopifyPlus = {
  pill: "Shopify Plus",
  title: ["Built to scale with", { accent: "Shopify Plus." }] as const,
  lead: "For brands doing serious volume. I build with the Plus features that standard stores can't use, so your store grows without limits.",
  checkout: {
    title: "Checkout Extensibility",
    text: "Custom checkout steps, upsells and trust badges that raise your average order value.",
    item: ["Linen tote", "$52"],
    upsell: ["Add matching pouch?", "+ $14"],
    total: ["Total", "$66"],
  },
  functions: {
    title: "Shopify Functions",
    text: "Custom discount, shipping and payment rules written in code.",
    code: ["fn", "discount.run()"],
  },
  b2b: {
    title: "B2B and wholesale",
    text: "Company accounts, price lists and payment terms on the same store.",
    row: ["Wholesale price", "-30%"],
  },
  markets: {
    title: "Shopify Markets",
    text: "Sell worldwide with local currencies, languages and domains.",
    currencies: ["USD $", "GBP £", "EUR €", "AED", "PKR ₨"],
  },
  flow: {
    title: "Shopify Flow",
    text: "Automations that tag orders, alert your team and restock for you.",
  },
  launchpad: {
    title: "Launchpad",
    text: "Schedule sales, theme changes and product drops to go live on their own, right on time.",
    steps: ["Sale starts", "Theme switches", "Products go live", "Sale ends"],
  },
};

export const aiAssistant = {
  title: ["AI that helps", ["shoppers ", { accent: "buy." }]] as const,
  lead: "I add AI features to Shopify stores so customers find the right product faster and you sell more.",
  features: [
    { icon: "search", title: "Smart search", text: "Understands what shoppers mean, typos included." },
    { icon: "lines", title: "AI product descriptions", text: "On-brand copy for hundreds of products in minutes." },
    { icon: "chat", title: "Shopping assistant", text: "Recommends products like a helpful salesperson." },
  ] satisfies { icon: IconName; title: string; text: string }[],
  chat: {
    name: "Store assistant",
    caption: "Demo of an AI feature",
    question: "Show me a gift for my mum under $50",
    reply: "Here are three gifts she'll love, all under $50:",
    picks: [
      { name: "Silk scarf", price: "$42", tint: "#F5C6D6" },
      { name: "Candle set", price: "$36", tint: "#FFE2A8" },
      { name: "Card holder", price: "$29", tint: "#CFC8FF" },
    ],
    followUp: "Want me to add gift wrapping?",
    replay: "Replay demo",
  },
};

export const voiceAssistant = {
  pill: "New: AI voice",
  title: ["Talk to my", { accent: "AI assistant." }] as const,
  lead: "This is the kind of voice assistant I can add to your store. Shoppers ask out loud and get spoken answers and product picks. Try it: tap the orb and ask about my services.",
  features: [
    { icon: "mic", title: "Voice product search", text: "“Do you have this in blue?” answered in seconds." },
    { icon: "chat", title: "Answers shopper questions", text: "Shipping, sizes and returns, any time of day." },
    { icon: "phone", title: "Works on any phone", text: "Right in the browser, no app to download." },
  ] satisfies { icon: IconName; title: string; text: string }[],
  questions: [
    "What services do you offer?",
    "Do you work with Shopify Plus?",
    "How long does a store take?",
    "Can you add AI to my store?",
    "Can you rank my store in ChatGPT?",
  ],
  status: {
    idle: "Tap the orb and ask a question",
    listening: "Listening, ask me anything",
    thinking: "Thinking…",
    speaking: "Speaking",
    unsupported: "Voice input isn't supported in this browser. Tap a question below.",
    noMicrophone: "Microphone isn't available here. Tap a question below.",
    noSpeech: "I didn't catch that. Tap the orb to try again.",
  },
  you: "You",
  assistant: "Assistant",
  talk: "Talk to the AI assistant",
  stop: "Stop listening",
  questionsLabel: "Example questions",
  note: "Demo assistant that answers questions about my services.",
};

export const webSection = {
  pill: "Software engineer",
  title: ["More than a", { accent: "Shopify developer." }] as const,
  /** **double asterisks** mark the bold phrases. */
  lead: "I'm a software engineer, so I also build **SaaS websites**, **web apps** and **WordPress sites**, and I migrate websites from one platform to another while protecting your content and SEO.",
  cards: [
    { icon: "app", title: "SaaS websites", text: "Marketing sites for software products that turn visitors into sign-ups." },
    { icon: "dash", title: "Web apps and dashboards", text: "Custom apps built with React, Next.js and Node.js." },
    { icon: "wp", title: "WordPress and WooCommerce", text: "Fast, custom WordPress sites that are easy for your team to edit." },
  ] satisfies { icon: IconName; title: string; text: string }[],
  migration: {
    title: "Website migration, from any platform to any platform",
    from: "From",
    to: "To",
    platforms: ["WordPress", "WooCommerce", "Wix", "Squarespace", "Magento"],
    destination: "Shopify",
    packets: ["Products", "Customers", "Orders", "Pages", "SEO"],
    checklist: ["Products", "Customers", "Orders", "Pages and blog", "SEO redirects"],
    progress: "Migrating",
    done: "Migration complete",
    label:
      "Animated demo: a store moves from WordPress, WooCommerce, Wix, Squarespace or Magento to Shopify, bringing its products, customers, orders, pages and blog, and SEO redirects.",
  },
  platformsLabel: "Platforms I work with",
  platforms: [
    "Shopify",
    "Shopify Plus",
    "WordPress",
    "WooCommerce",
    "Webflow",
    "Wix",
    "Squarespace",
    "Magento",
    "BigCommerce",
    "React",
    "Next.js",
    "Node.js",
  ],
};

export const servicesSection = {
  title: ["What I can", ["do for ", { accent: "you." }]] as const,
  intro: "Shopify stores, SaaS websites, WordPress and AI features. Pick a category to filter.",
  filterLabel: "Filter services",
};

export const pricingSection = {
  title: ["Simple, clear", { accent: "pricing." }] as const,
  lead: "Every store is different, so these are starting points. You'll get an exact quote after a quick call.",
  popular: "Most popular",
};

export const faqSection = {
  title: ["Questions,", { accent: "answered." }] as const,
};
