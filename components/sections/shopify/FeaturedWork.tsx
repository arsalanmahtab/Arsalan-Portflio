"use client";

import clsx from "clsx";
import { useRef } from "react";
import { domainOf, featuredWork, isPlaceholder, type FeaturedProject } from "@/data/projects";
import { featuredSection as copy } from "@/data/shopify";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { BrowserBar } from "@/components/ui/BrowserBar";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";

const panelClass = "w-[min(82vw,1000px)] rounded-[22px] p-6.5 max-[859px]:w-auto";

function Value({ text }: { text: string }) {
  return isPlaceholder(text) ? <span className="ph">{text}</span> : <>{text}</>;
}

/** A browser preview of the store whose page scrolls on hover. */
function StorePreview({ project }: { project: FeaturedProject }) {
  const domain = domainOf(project.url);
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="Visit"
      aria-label={`Open the live ${project.name} store (opens in a new tab)`}
      className="group block overflow-hidden rounded-[14px] bg-white"
    >
      <BrowserBar url={domain} />
      <div className="h-[clamp(220px,28vw,330px)] overflow-hidden" aria-hidden="true">
        <div className="grid gap-3 p-4 transition-transform duration-[3s] ease-[cubic-bezier(.4,0,.2,1)] group-hover:translate-y-[-45%] group-focus-visible:translate-y-[-45%]">
          <div
            className="flex h-42.5 items-end rounded-[10px] p-4 font-display text-[1.6rem] font-extrabold"
            style={{ background: project.preview.background, color: project.preview.color }}
          >
            {project.name}
          </div>
          {project.preview.layout.map((part, index) =>
            part === "row" ? (
              <div key={index} className="grid grid-cols-4 gap-2.5">
                {[0, 1, 2, 3].map((tile) => (
                  <i key={tile} className="aspect-[3/4] rounded-lg bg-[#ECE9F7]" />
                ))}
              </div>
            ) : (
              <div key={index} className="h-17.5 rounded-[10px] bg-[#ECE9F7]" />
            ),
          )}
        </div>
      </div>
    </a>
  );
}

/**
 * "Selected work": glass panels for the featured stores and a violet
 * "Your store could be next" panel. Wide screens scroll them sideways while the
 * section is pinned; small screens stack them with a reveal.
 */
export function FeaturedWork() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 860px)", () => {
        const distance = () =>
          Math.max(0, (track.current?.scrollWidth ?? 0) - document.documentElement.clientWidth);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    // No overflow clipping on the pinned section itself: Chrome then reports the pin as a
    // full-screen layout shift. The wrapper around the track does the clipping instead.
    <section ref={root} id="work" className="relative border-t border-line">
      <div className="flex min-h-svh flex-col justify-center gap-11 pt-22.5 pb-12.5">
        <div className="wrap flex w-full flex-wrap items-end justify-between gap-5">
          <SplitText reveal lines={[copy.title]} className="text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] font-bold" />
          <p className="m-0 text-fg-2">
            {copy.intro}{" "}
            <a href="#stores" className="font-semibold text-fg underline underline-offset-4">
              {copy.allStoresLink}
            </a>
          </p>
        </div>

        <div className="overflow-x-clip">
          <div
            ref={track}
            className="flex w-max gap-7 px-[clamp(20px,4vw,48px)] max-[859px]:w-auto max-[859px]:flex-col"
          >
            {featuredWork.map((project) => (
              <SectionReveal key={project.name} amount={0.2}>
                <article
                  className={clsx(
                    "glass glass-sheen grid items-center gap-7 min-[860px]:grid-cols-[1.3fr_1fr]",
                    panelClass,
                  )}
                >
                  <StorePreview project={project} />
                  <div>
                    <h3 className="mb-2 text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none">{project.name}</h3>
                    <p className="mb-4.5 text-fg-2">{domainOf(project.url)}</p>
                    <dl className="mb-5.5 grid gap-3">
                      <div>
                        <dt className="font-bold">{copy.builtLabel}</dt>
                        <dd className="m-0 text-fg-2">
                          <Value text={project.role} />
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold">{copy.resultLabel}</dt>
                        <dd className="m-0 text-fg-2">
                          <Value text={project.result} />
                        </dd>
                      </div>
                    </dl>
                    <AnimatedButton href={project.url} external size="sm">
                      {copy.visitLabel}
                    </AnimatedButton>
                  </div>
                </article>
              </SectionReveal>
            ))}
            <SectionReveal amount={0.2}>
              <article
                className={clsx(
                  "grid min-h-[clamp(300px,34vw,400px)] content-center justify-items-start gap-7 bg-violet text-on-violet",
                  panelClass,
                )}
              >
                <h3 className="text-[clamp(2.2rem,5vw,4.2rem)] leading-none">
                  {copy.next.title[0]}
                  <br />
                  {copy.next.title[1]}
                </h3>
                <AnimatedButton href="#contact" variant="onViolet">
                  {copy.next.cta}
                </AnimatedButton>
              </article>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
