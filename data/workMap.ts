import { domainOf, projects } from "@/data/projects";

/**
 * The work map (shared section on both homes): every area I work in as a hub,
 * linked to the things I build there. Hover an area to light it up; click to
 * zoom in on its own colour with the full list beside it.
 */

/** A small picture drawn in place of a dot. Stores always show as a mini storefront. */
export type MapThumb = "store" | "code" | "chart" | "chat" | "page";

export type MapItem = {
  title: string;
  /** One line under the title in the tooltip and the list. */
  text: string;
  /** Opens in a new tab from the list, or when the item is clicked on the zoomed map. */
  url?: string;
  thumb?: MapThumb;
  /** Ids of other areas this item belongs to, drawn as faint lines across the map. */
  also?: readonly string[];
};

export type MapArea = {
  id: string;
  label: string;
  /** Background of the zoomed view. Dark enough for white text and lime highlights. */
  color: string;
  summary: string;
  items: readonly MapItem[];
};

export const workMapSection = {
  pill: "Work map",
  title: ["Everything I build,", { accent: "mapped." }] as const,
  lead: "From Shopify stores to AI agents, everything I work on in one map. Hover an area to light it up, then click to zoom in.",
  /** Describes the drawing for screen readers; the area buttons and lists carry the content. */
  label: "Map of my work: each area I work in is a hub, linked to the things I build there. Use the area buttons below the map to explore it.",
  centre: "Arslan",
  areasCount: "areas",
  itemsCount: "things I build",
  hint: { pointer: "Click an area to zoom in · drag to move the map", touch: "Tap an area to zoom in" },
  back: "All areas",
  previous: "Previous area",
  next: "Next area",
  areasLabel: "Areas of the map",
  itemsLabel: "In this area",
  /** Under a store's name in the tooltip once its area is zoomed in. */
  visitHint: { pointer: "Click to visit", touch: "Tap again to visit" },
};

export const workMapAreas: readonly MapArea[] = [
  {
    id: "stores",
    label: "Stores",
    color: "#17614A",
    summary: "Every one of these is a Shopify store I've designed or built. Open one to see it live.",
    items: projects.map((project) => ({
      title: project.name,
      text: domainOf(project.url),
      url: project.url,
      thumb: "store",
    })),
  },
  {
    id: "themes",
    label: "Themes",
    color: "#3F2FC2",
    summary: "Custom Shopify themes in clean Liquid, with sections your team can edit without calling a developer.",
    items: [
      { title: "Liquid", text: "Clean Liquid and JavaScript, built to load fast.", thumb: "code" },
      { title: "Custom sections", text: "Sections your team can edit without calling a developer." },
      { title: "Online Store 2.0", text: "Sections and blocks on every page, not just the home page." },
      { title: "Theme editor ready", text: "Change your pages yourself in the Shopify theme editor." },
      { title: "New Shopify store", text: "A complete store designed around your brand, ready to sell from day one.", thumb: "page" },
      { title: "Payments and shipping", text: "Set up so you can take orders from launch day.", also: ["integrations"] },
      { title: "Mobile-first pages", text: "Pages shaped around how your customers shop on their phones." },
      { title: "Landing pages", text: "High-converting pages for launches, sales and ad campaigns.", also: ["web"] },
      { title: "Conversion design", text: "Layouts that guide shoppers from first look to checkout.", also: ["speed"] },
      { title: "Handover walkthrough", text: "A walkthrough so your team knows how to run the theme." },
      { title: "Headless with Hydrogen", text: "Ultra-fast custom storefronts built on Shopify Hydrogen.", also: ["frontend"] },
    ],
  },
  {
    id: "plus",
    label: "Shopify Plus",
    color: "#0C5A63",
    summary: "For brands doing serious volume: the Plus features standard stores can't use, set up so your store grows without limits.",
    items: [
      { title: "Checkout Extensibility", text: "Custom checkout steps, upsells and trust badges that raise order value.", thumb: "page" },
      { title: "Shopify Functions", text: "Custom discount, shipping and payment rules written in code.", thumb: "code", also: ["backend"] },
      { title: "B2B and wholesale", text: "Company accounts, price lists and payment terms on the same store." },
      { title: "Shopify Markets", text: "Sell worldwide with local currencies, languages and domains." },
      { title: "Shopify Flow", text: "Automations that tag orders, alert your team and restock for you.", also: ["integrations"] },
      { title: "Launchpad", text: "Sales, theme changes and product drops that go live on their own." },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    color: "#94440F",
    summary: "I find what slows your store down and what stops shoppers from buying, then fix it and show you the numbers.",
    items: [
      { title: "Speed audit", text: "Find exactly what slows each page down." },
      { title: "Core Web Vitals", text: "Faster loading, steadier layouts and quicker responses to taps.", thumb: "chart" },
      { title: "Image cleanup", text: "Right-sized images in modern formats that load fast." },
      { title: "App cleanup", text: "Remove apps and leftover code that slow the store down." },
      { title: "Checkout improvements", text: "Fewer reasons for shoppers to leave before they pay.", also: ["plus"] },
      { title: "Before and after report", text: "The numbers before and after, so you see the difference.", thumb: "chart" },
      { title: "Store care plan", text: "Monthly updates, fixes and improvements so your store never falls behind." },
    ],
  },
  {
    id: "ai-search",
    label: "AI search",
    color: "#1A4594",
    summary: "Shoppers now ask AI what to buy. I make your store easy for AI tools to understand, so they recommend your brand.",
    items: [
      { title: "ChatGPT", text: "Get your store recommended in ChatGPT answers.", thumb: "chat" },
      { title: "Claude", text: "Get your store recommended in Claude answers." },
      { title: "Gemini", text: "Get your store recommended in Gemini answers." },
      { title: "Perplexity", text: "Get your store recommended in Perplexity answers." },
      { title: "Google AI Overviews", text: "Show up in the AI answers at the top of Google." },
      { title: "AI-readable product data", text: "Structured data so AI tools know exactly what you sell.", also: ["stores"] },
      { title: "AI-friendly FAQs", text: "Clear FAQs, comparisons and buying guides on your store." },
      { title: "llms.txt", text: "An AI guide file that tells AI tools what your site is about." },
      { title: "Trust signals", text: "Reviews and brand mentions that AI tools trust.", also: ["integrations"] },
      { title: "Shopify SEO", text: "Clean structure and product data so customers find you on Google.", also: ["migration"] },
    ],
  },
  {
    id: "ai",
    label: "AI apps",
    color: "#62109C",
    summary: "AI that helps shoppers buy and helps teams work faster, from smart search to agents that answer from your own data.",
    items: [
      { title: "Smart search", text: "Understands what shoppers mean, typos included." },
      { title: "AI product descriptions", text: "On-brand copy for hundreds of products in minutes.", also: ["stores"] },
      { title: "Shopping assistant", text: "Recommends products like a helpful salesperson.", thumb: "chat" },
      { title: "Voice assistant", text: "Shoppers ask out loud and get spoken answers and product picks." },
      { title: "Chatbots", text: "Support answers from your own data, any time of day." },
      { title: "AI agents", text: "Agents that look things up, take actions and report back.", thumb: "code" },
      { title: "RAG search", text: "Answers grounded in your own documents.", also: ["backend"] },
      { title: "LLM APIs", text: "Language models wired into your product.", also: ["backend"] },
      { title: "Embeddings and vector DB", text: "Turn text into vectors and find what matters." },
    ],
  },
  {
    id: "saas",
    label: "SaaS",
    color: "#8C2D55",
    summary: "Next.js SaaS products from idea to launch: auth, subscriptions, dashboards and teams, built to grow with your users.",
    items: [
      { title: "Authentication", text: "Sign-up, log-in and secure accounts.", also: ["backend"] },
      { title: "Subscriptions and billing", text: "Plans and recurring payments that just work.", also: ["integrations"] },
      { title: "Dashboards", text: "Clear screens and charts your users understand at first glance.", thumb: "chart" },
      { title: "Teams", text: "Invite teammates and work together in one account." },
      { title: "Plan", text: "Features, users and the simplest version worth launching." },
      { title: "Launch", text: "Deployed, tested and monitored." },
      { title: "Scale", text: "New features as your users grow." },
    ],
  },
  {
    id: "frontend",
    label: "Front end",
    color: "#0B5C91",
    summary: "Fast, polished interfaces in React and Next.js, typed end to end.",
    items: [
      { title: "React", text: "Interfaces built from clean, reusable components." },
      { title: "Next.js", text: "Fast, search-friendly apps and websites.", thumb: "code", also: ["saas"] },
      { title: "TypeScript", text: "Typed code that's safer to change." },
      { title: "Tailwind CSS", text: "Consistent, responsive styling." },
      { title: "Animation and 3D", text: "GSAP, Motion and Three.js, like this site." },
    ],
  },
  {
    id: "backend",
    label: "Back end",
    color: "#6E2433",
    summary: "Laravel and Node.js back ends with clean APIs and data that stays fast as it grows.",
    items: [
      { title: "Laravel", text: "Solid APIs and admin back ends." },
      { title: "PHP", text: "Modern, well-structured PHP." },
      { title: "Node.js", text: "APIs and services in JavaScript, end to end." },
      { title: "REST APIs", text: "Clean, documented endpoints for your apps.", thumb: "code" },
      { title: "MySQL", text: "Well-structured data that stays fast as it grows." },
      { title: "Webhooks", text: "React to payments, orders and events as they happen.", also: ["integrations"] },
    ],
  },
  {
    id: "web",
    label: "Websites",
    color: "#2E3480",
    summary: "SaaS marketing sites, web apps and WordPress builds that are fast and easy for your team to edit.",
    items: [
      { title: "SaaS websites", text: "Marketing sites that turn visitors into sign-ups.", thumb: "page", also: ["saas"] },
      { title: "Web apps and dashboards", text: "Custom web apps built with React, Next.js and Node.js.", also: ["frontend"] },
      { title: "WordPress", text: "Fast, custom WordPress sites your team can edit easily." },
      { title: "WooCommerce", text: "Online stores on WordPress, built to sell." },
      { title: "Plugins", text: "Custom WordPress plugins when an off-the-shelf one won't do." },
      { title: "Webflow", text: "Websites designed and built in Webflow." },
      { title: "Pricing and docs pages", text: "The pages that help visitors choose and get started." },
    ],
  },
  {
    id: "migration",
    label: "Migration",
    color: "#9B2F25",
    summary: "Move from any platform to any platform, bringing your content and data and protecting your SEO.",
    items: [
      { title: "From WordPress", text: "Move a WordPress site to Shopify or a custom stack." },
      { title: "From WooCommerce", text: "Products, customers and orders, moved to Shopify." },
      { title: "From Wix", text: "Move a Wix site to a platform you can grow on." },
      { title: "From Squarespace", text: "Move a Squarespace site without losing content." },
      { title: "From Magento", text: "Move a Magento store to Shopify." },
      { title: "Products and customers", text: "Every product, variant and customer account, moved." },
      { title: "Order history", text: "Past orders come with you." },
      { title: "Pages and blog", text: "Your content, moved and tidied up." },
      { title: "SEO redirects", text: "Old links point to the new pages, so you keep your rankings.", also: ["ai-search"] },
      { title: "Launch checklist", text: "Tested before the switch, so launch day is calm." },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    color: "#6B5100",
    summary: "Connect reviews, email, payments and stock systems, or get a custom app built when nothing off the shelf fits.",
    items: [
      { title: "Klaviyo", text: "Email and SMS flows connected to your store." },
      { title: "Reviews", text: "Product reviews that build trust with shoppers." },
      { title: "Payments", text: "Payment providers set up and connected.", also: ["saas"] },
      { title: "Stock systems", text: "Inventory kept in sync with your stock system." },
      { title: "Custom apps", text: "A custom Shopify app when no app store app fits.", thumb: "code", also: ["plus"] },
      { title: "Third-party APIs", text: "Connect the tools your business already uses.", also: ["backend"] },
    ],
  },
];
