"use client";

import clsx from "clsx";
import { useRef, useState, type ReactNode } from "react";
import { codeToCheckout as copy } from "@/data/shopify";
import { BrowserBar } from "@/components/ui/BrowserBar";
import { SplitText } from "@/components/ui/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";

/** Product illustrations for the mock store, in the order of copy.store.products. */
const productArt: ReactNode[] = [
  <svg key="serum" viewBox="0 0 60 80">
    <rect x="20" y="4" width="20" height="12" rx="3" fill="#141029" />
    <rect x="10" y="16" width="40" height="60" rx="10" fill="#5440EE" />
    <rect x="18" y="36" width="24" height="18" rx="3" fill="#FFB547" />
  </svg>,
  <svg key="tote" viewBox="0 0 80 80">
    <path d="M14 30h52l-6 44H20z" fill="#FFB547" />
    <path d="M28 30v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#141029" strokeWidth="5" />
  </svg>,
  <svg key="mug" viewBox="0 0 80 80">
    <rect x="12" y="20" width="44" height="50" rx="6" fill="#141029" />
    <path d="M56 32h6a8 8 0 0 1 0 16h-6" fill="none" stroke="#141029" strokeWidth="6" />
    <rect x="18" y="30" width="32" height="8" rx="3" fill="#8A7CFF" />
  </svg>,
];

/** Liquid tags in amber, output tags in violet. */
function CodeLine({ line }: { line: string }) {
  return (
    <span data-code-line="" className="block">
      {line.split(/(\{%.*?%\}|\{\{.*?\}\})/).map((token, index) =>
        token.startsWith("{%") ? (
          <span key={index} className="text-[#FFB547]">
            {token}
          </span>
        ) : token.startsWith("{{") ? (
          <span key={index} className="text-[#A99FFF]">
            {token}
          </span>
        ) : (
          token
        ),
      )}
      {line === "" && " "}
    </span>
  );
}

/** A store block that starts as a grey wireframe; the cover fades to reveal it. */
function Block({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-block="" className={clsx("relative overflow-hidden rounded-[10px]", className)}>
      {children}
      <i data-cover="" className="absolute inset-0 z-2 bg-[#E4E0F2]" />
    </div>
  );
}

/**
 * "From code to checkout." Pinned for about 1800px of scroll: Liquid code types
 * in, fades, wireframe blocks pop in and fill with a real store, Add to cart is
 * pressed and an order arrives. The steps on the left follow along.
 */
export function CodeToCheckout() {
  const root = useRef<HTMLElement>(null);
  const bag = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const count = { value: 0 };
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=1800",
            pin: true,
            scrub: 1,
            onUpdate: (self) => setStep(self.progress < 0.4 ? 0 : self.progress < 0.75 ? 1 : 2),
          },
        })
        .from(q("[data-code-line]"), { opacity: 0, x: -24, stagger: 0.12, duration: 0.3 })
        .to(q("[data-code]"), { opacity: 0, scale: 0.9, duration: 0.5 }, "+=0.3")
        .from(q("[data-block]"), { opacity: 0, scale: 0.5, stagger: 0.1, duration: 0.5, ease: "back.out(2)" }, "<")
        .to(q("[data-cover]"), { opacity: 0, stagger: 0.12, duration: 0.5 }, "+=0.3")
        .to(q("[data-add]"), { scale: 0.85, yoyo: true, repeat: 1, duration: 0.12, stagger: 0.25 }, "+=0.2")
        .to(
          count,
          {
            value: copy.store.products.length,
            duration: 0.6,
            onUpdate: () => {
              if (bag.current) bag.current.textContent = String(Math.round(count.value));
            },
          },
          "<",
        )
        .fromTo(
          q("[data-toast]"),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)", immediateRender: true },
        )
        .to({}, { duration: 0.4 });
    },
    { scope: root },
  );

  const { store } = copy;

  return (
    <section ref={root} id="build" className="flex min-h-svh items-center border-t border-line pt-22.5 pb-10">
      <div className="wrap grid w-full items-center gap-10 min-[900px]:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SplitText
            reveal
            lines={copy.title}
            className="mb-7 text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] font-bold max-[899px]:mb-3"
          />
          <ol className="grid gap-1.5">
            {copy.steps.map((item, index) => {
              const active = index === step;
              return (
                <li
                  key={item.title}
                  aria-current={active ? "step" : undefined}
                  className={clsx(
                    "relative border-t border-line py-4 pl-14 transition-opacity duration-400",
                    active ? "opacity-100" : "opacity-35 max-[899px]:hidden",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "absolute top-3.5 left-0 grid size-9.5 place-items-center rounded-full border-[1.5px] font-bold transition-colors duration-400",
                      active ? "border-lime bg-lime text-on-lime" : "border-fg-2",
                    )}
                  >
                    {index + 1}
                  </span>
                  <b className="block text-[1.15rem]">{item.title}</b>
                  <span className="text-fg-2">{item.text}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div
          role="img"
          aria-label={copy.demoLabel}
          className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-white text-[#141029] shadow-[0_40px_80px_-30px_rgb(84_64_238/0.55)]"
        >
          <BrowserBar url={store.url}>
            <span className="flex items-center gap-1 text-[0.85rem] font-extrabold">
              {store.bag} <span ref={bag}>0</span>
            </span>
          </BrowserBar>
          <div className="relative h-[clamp(300px,40vw,430px)] overflow-hidden">
            <pre
              data-code=""
              className="absolute inset-0 z-2 m-0 overflow-hidden bg-[#141029] p-5.5 font-mono text-[clamp(0.7rem,1.3vw,0.85rem)] leading-[1.75] font-medium whitespace-pre text-[#DCD8F5]"
            >
              {copy.code.map((line, index) => (
                <CodeLine key={index} line={line} />
              ))}
            </pre>

            <div className="absolute inset-0 flex flex-col gap-3.5 p-4.5">
              <Block className="flex items-center justify-between px-2 py-1.5">
                <b className="font-display font-extrabold">{store.name}</b>
                <span className="flex gap-2">
                  <i className="h-2 w-9 rounded bg-[#DDD8F0]" />
                  <i className="h-2 w-9 rounded bg-[#DDD8F0]" />
                  <i className="h-2 w-9 rounded bg-[#DDD8F0]" />
                </span>
              </Block>
              <Block className="bg-linear-120 from-[#5440EE] to-[#8A7CFF] p-5.5 text-white">
                <b className="block font-display text-2xl">{store.banner}</b>
                {store.bannerNote}
              </Block>
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
                {store.products.map((product, index) => (
                  <Block key={product.name} className="flex flex-col gap-1.5 bg-[#F6F4FC] p-2">
                    <div
                      className="grid min-h-12.5 flex-1 place-items-center rounded-lg [&_svg]:max-h-[80%] [&_svg]:w-[52%]"
                      style={{ background: product.tint }}
                    >
                      {productArt[index]}
                    </div>
                    <div className="flex justify-between text-[0.8rem] font-bold">
                      <span>{product.name}</span>
                      <span>{product.price}</span>
                    </div>
                    <span
                      data-add=""
                      className="rounded-md bg-[#141029] px-1 py-1.75 text-center text-[0.72rem] font-bold text-white"
                    >
                      {store.addToCart}
                    </span>
                  </Block>
                ))}
              </div>
            </div>

            <div
              data-toast=""
              className="absolute bottom-4.5 left-1/2 z-3 -translate-x-1/2 rounded-full bg-[#FFB547] px-4.5 py-2.5 text-[0.9rem] font-extrabold whitespace-nowrap text-[#1A1206] opacity-0 shadow-[0_10px_30px_rgb(0_0_0/0.25)]"
            >
              {store.toast}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
