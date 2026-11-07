/** FAQ on the Shopify home. PLACEHOLDER: review the final wording before launch. */

export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
  {
    question: "How long does a new store take?",
    answer:
      "It depends on the size of the store and the features you need. Most projects take a few weeks, and you'll get an exact timeline after our first call.",
  },
  {
    question: "Do you work with Shopify Plus?",
    answer: "Yes. I build with Plus features like Checkout Extensibility, Shopify Functions, B2B, Markets and Flow.",
  },
  {
    question: "Will I be able to edit the store myself?",
    answer: "Yes. Everything is built with sections you can edit in the Shopify theme editor, no coding needed.",
  },
  {
    question: "Can you add AI to my existing store?",
    answer:
      "Yes. I can add smart search, AI product descriptions, a chat assistant or a voice assistant to the store you already have.",
  },
  {
    question: "Can you rank my store in ChatGPT and Claude?",
    answer:
      "I optimize your store so AI tools can read and trust it: structured product data, clear answers, reviews and an llms.txt file. No one can guarantee a spot in AI answers, but these steps give your store a much better chance of being recommended.",
  },
  {
    question: "Do you only work with Shopify?",
    answer:
      "No. I'm a software engineer, so I also build SaaS websites, web apps with React and Next.js, and WordPress and WooCommerce sites. I also migrate websites between platforms.",
  },
  {
    question: "Do you offer support after launch?",
    answer: "Yes. You can choose a monthly care plan, or contact me whenever you need fixes or new features.",
  },
  {
    question: "How do we get started?",
    answer: "Send me a message with the contact form, by email or on LinkedIn. We'll have a quick call, then I'll send you a clear plan and quote.",
  },
];
