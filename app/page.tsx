/*
 * Phase 1 placeholder: a quick check of fonts, design tokens, smooth scroll and
 * the scroll progress line. Replaced by the Shopify home in phase 4.
 */

const TOKENS = [
  "bg",
  "bg-2",
  "card",
  "fg",
  "fg-2",
  "line",
  "violet",
  "on-violet",
  "lime",
  "on-lime",
  "lime-text",
  "glass",
] as const;

const TYPE = [
  { label: "Syne 600", className: "font-display font-semibold" },
  { label: "Syne 700", className: "font-display font-bold" },
  { label: "Syne 800", className: "font-display font-extrabold" },
  { label: "Manrope 400", className: "font-normal" },
  { label: "Manrope 500", className: "font-medium" },
  { label: "Manrope 600", className: "font-semibold" },
  { label: "Manrope 700", className: "font-bold" },
  { label: "Instrument Serif italic", className: "serif-accent" },
] as const;

export default function Home() {
  return (
    <main id="top">
      <section className="wrap flex min-h-svh flex-col justify-center py-28">
        <p className="mb-5 font-semibold text-fg-2">
          Arslan Mahtab, software engineer and senior Shopify developer
        </p>
        <h1 className="mb-8 max-w-[9.5em] text-[clamp(3rem,9vw,8.4rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
          Shopify stores built for <span className="serif-accent text-violet">the AI era.</span>
        </h1>
        <p className="mb-8 max-w-[30em] text-xl text-fg-2">
          Phase 1 setup check: fonts, design tokens, ambient light, film grain, smooth scrolling
          and the scroll progress line.
        </p>
        <a href="#tokens" className="w-fit font-bold text-lime-text underline underline-offset-4">
          Jump to the design tokens
        </a>
      </section>

      <section id="tokens" className="wrap border-t border-line py-[clamp(80px,11vw,150px)]">
        <h2 className="mb-10 text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[0.95] font-extrabold">
          Design <span className="serif-accent">tokens.</span>
        </h2>
        <ul className="mb-16 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {TOKENS.map((token) => (
            <li key={token} className="rounded-2xl border border-line bg-glass p-3">
              <span
                className="block h-16 rounded-xl border border-glass-border"
                style={{ background: `var(--${token})` }}
              />
              <code className="mt-2 block text-sm text-fg-2">--{token}</code>
            </li>
          ))}
        </ul>
        <ul className="grid gap-4">
          {TYPE.map(({ label, className }) => (
            <li key={label} className="flex flex-wrap items-baseline gap-x-6 border-t border-line pt-4">
              <span className="w-56 shrink-0 text-sm text-fg-2">{label}</span>
              <span className={`${className} text-3xl`}>From code to checkout.</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap min-h-[120vh] border-t border-line py-[clamp(80px,11vw,150px)]">
        <h2 className="mb-6 text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[0.95] font-extrabold">
          Scroll <span className="serif-accent">smoothly.</span>
        </h2>
        <p className="mb-8 max-w-[34em] text-lg text-fg-2">
          Lenis drives the page from the GSAP ticker and keeps ScrollTrigger in sync. The line at
          the top of the window fills as you go.
        </p>
        <a href="#top" className="w-fit font-bold text-lime-text underline underline-offset-4">
          Back to top
        </a>
      </section>
    </main>
  );
}
