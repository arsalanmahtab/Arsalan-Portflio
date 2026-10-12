import { services } from "@/data/services";

/**
 * The voice assistant's answers. Without AI_API_KEY (or if the AI call fails),
 * the first keyword rule that matches the question answers it.
 * PLACEHOLDER: review the final wording before launch.
 */

export const keywordAnswers: { pattern: RegExp; answer: string }[] = [
  {
    pattern: /wordpress|woo|saas|software|web ?app|react|next|migrat|webflow|wix|squarespace|magento/i,
    answer:
      "Yes. Arslan is a software engineer. He builds SaaS websites, web apps and WordPress sites, and migrates websites from one platform to another.",
  },
  {
    pattern: /chat ?gpt|claude|gemini|perplexity|rank|ranking|ai search|seo|google/i,
    answer:
      "Yes. Arslan optimizes Shopify stores so AI tools like ChatGPT and Claude understand your products and can recommend your brand.",
  },
  {
    pattern: /plus|enterprise|scale|b2b|wholesale/i,
    answer: "Yes. Arslan builds with Shopify Plus features like Checkout Extensibility, Shopify Functions, B2B and Markets.",
  },
  {
    pattern: /\bai\b|voice|assistant|smart|chat/i,
    answer:
      "Yes. Arslan can add AI to your store, like smart search, AI product descriptions, or a voice assistant just like me.",
  },
  {
    pattern: /long|time|timeline|week|day|fast|quick/i,
    answer:
      "It depends on your store. Most projects take a few weeks. Book a quick call and Arslan will give you an exact timeline.",
  },
  {
    pattern: /cost|price|pricing|much|budget|charge|fee/i,
    answer: "Pricing depends on what you need. Have a look at the pricing section, or book a call for an exact quote.",
  },
  {
    pattern: /service|offer|do you do|help|build|make/i,
    answer:
      "Arslan builds new Shopify stores, custom themes, store migrations, speed fixes, SEO, and AI features like smart search and voice assistants.",
  },
  {
    pattern: /contact|hire|reach|email|whatsapp|call|talk to/i,
    answer: "Scroll to the bottom of the page and tap Email me or WhatsApp. Arslan will get back to you.",
  },
  { pattern: /hello|hi\b|hey|who are you/i, answer: "Hi! I'm Arslan's AI assistant. Ask me about his Shopify services." },
];

export const defaultAnswer =
  "Good question. Arslan can answer that on a quick call. Tap Email me or WhatsApp at the bottom of the page.";

export function answerFromKeywords(question: string) {
  return keywordAnswers.find((rule) => rule.pattern.test(question))?.answer ?? defaultAnswer;
}

/** System prompt for the AI answers (used by app/api/assistant/route.ts when AI_API_KEY is set). */
export const assistantSystemPrompt = `You are the voice assistant on the portfolio website of Arslan Mahtab, a software engineer and senior Shopify developer based in Pakistan who works with clients worldwide.

Answer visitors' questions about Arslan and his services. Your answer is read aloud, so reply in one to three short, friendly sentences of plain spoken English: no markdown, lists, links or emoji. Refer to Arslan in the third person.

What Arslan offers:
${services.map((service) => `- ${service.title}: ${service.description}`).join("\n")}
He also builds Next.js SaaS products, full stack web apps (React or Next.js with Laravel or Node.js), and AI apps and agents.

Rules:
- Prices and timelines depend on the project: say so and suggest a quick call. Never invent prices, dates, clients or results.
- To get in touch, visitors tap Email me or WhatsApp at the bottom of the page.
- If a question is not about Arslan's work, answer briefly and steer back to how he can help.

Latency-sensitive; begin your visible answer immediately.`;
