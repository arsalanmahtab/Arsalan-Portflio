/**
 * Site-wide settings. Edit these before going live.
 * Anything marked PLACEHOLDER is also listed in the README.
 */

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const site = {
  name: "Arslan Mahtab",
  role: "Software engineer and senior Shopify developer",
  description:
    "Shopify stores, SaaS websites and WordPress builds, plus migrations from any platform. Fast, modern and ready for AI search.",

  /**
   * Public address used for canonical links, Open Graph images and the sitemap.
   * Set NEXT_PUBLIC_SITE_URL once the custom domain is live; on Vercel it
   * otherwise falls back to the project's production URL.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000"),

  /** PLACEHOLDER: your real email address. */
  email: "you@example.com",
  /** PLACEHOLDER: your WhatsApp number in international format, digits only. */
  whatsapp: "923000000000",
  linkedin: "https://pk.linkedin.com/in/arslan-mahtab",
  timeZone: "Asia/Karachi",
} as const;
