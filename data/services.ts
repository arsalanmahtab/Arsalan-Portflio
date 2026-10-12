import type { IconName } from "@/components/ui/Icon";

/** Services shown in the filterable grid on the Shopify home. The voice assistant's prompt reads them too. */

export type ServiceCategory = "build" | "grow" | "web" | "ai";

export type Service = {
  category: ServiceCategory;
  icon: IconName;
  title: string;
  description: string;
  tags: string[];
};

/** Filter tabs, in display order. */
export const serviceFilters: { id: "all" | ServiceCategory; label: string }[] = [
  { id: "all", label: "All services" },
  { id: "build", label: "Build" },
  { id: "grow", label: "Grow" },
  { id: "web", label: "Web and SaaS" },
  { id: "ai", label: "AI and tech" },
];

export const categoryLabels: Record<ServiceCategory, string> = {
  build: "Build",
  grow: "Grow",
  web: "Web and SaaS",
  ai: "AI and tech",
};

export const services: Service[] = [
  {
    category: "build",
    icon: "bag",
    title: "New Shopify store",
    description: "A complete store designed around your brand and ready to sell from day one.",
    tags: ["Setup", "Design", "Payments"],
  },
  {
    category: "build",
    icon: "code",
    title: "Custom theme development",
    description: "Custom sections your team can edit without calling a developer.",
    tags: ["Liquid", "Sections", "Online Store 2.0"],
  },
  {
    category: "build",
    icon: "page",
    title: "Landing pages",
    description: "High-converting pages for launches, sales and ad campaigns.",
    tags: ["Launches", "Sales", "Ads"],
  },
  {
    category: "grow",
    icon: "bolt",
    title: "Speed and conversion",
    description: "I find what slows your store down and fix it, with before and after numbers.",
    tags: ["Core Web Vitals", "Images", "Apps cleanup"],
  },
  {
    category: "grow",
    icon: "search",
    title: "Shopify SEO",
    description: "Clean structure and product data so customers find you on Google.",
    tags: ["Schema", "Collections", "Meta"],
  },
  {
    category: "grow",
    icon: "heart",
    title: "Store care plan",
    description: "Monthly updates, fixes and improvements so your store never falls behind.",
    tags: ["Monthly", "Fixes", "New features"],
  },
  {
    category: "ai",
    icon: "chat",
    title: "Rank in ChatGPT and Claude",
    description: "Get your store recommended in ChatGPT, Claude, Gemini and Perplexity answers.",
    tags: ["ChatGPT", "Claude", "Structured data"],
  },
  {
    category: "ai",
    icon: "spark",
    title: "AI shopping features",
    description: "Smart search, AI product descriptions and a shopping assistant for your customers.",
    tags: ["Search", "Descriptions", "Assistant"],
  },
  {
    category: "ai",
    icon: "layers",
    title: "Headless with Hydrogen",
    description: "Ultra-fast custom storefronts built on Shopify Hydrogen.",
    tags: ["Hydrogen", "React", "Speed"],
  },
  {
    category: "ai",
    icon: "plug",
    title: "Apps and integrations",
    description: "Connect reviews, email, payments and stock systems, or get a custom app built for you.",
    tags: ["Klaviyo", "Reviews", "Custom apps"],
  },
  {
    category: "web",
    icon: "app",
    title: "SaaS websites",
    description: "Marketing sites for software products that turn visitors into sign-ups.",
    tags: ["Landing pages", "Pricing", "Docs"],
  },
  {
    category: "web",
    icon: "dash",
    title: "Web apps and dashboards",
    description: "Custom web apps and dashboards built with React, Next.js and Node.js.",
    tags: ["React", "Next.js", "APIs"],
  },
  {
    category: "web",
    icon: "globe",
    title: "WordPress development",
    description: "Fast, custom WordPress and WooCommerce sites your team can edit easily.",
    tags: ["WordPress", "WooCommerce", "Plugins"],
  },
  {
    category: "web",
    icon: "move",
    title: "Website migration",
    description: "Move from WordPress, Wix, Squarespace or Magento to Shopify, Webflow or a custom stack.",
    tags: ["Content", "Data", "SEO redirects"],
  },
];
