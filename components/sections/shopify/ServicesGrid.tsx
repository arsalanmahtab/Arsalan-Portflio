"use client";

import clsx from "clsx";
import { AnimatePresence, motion, stagger, useAnimate, useMotionValue, useSpring } from "motion/react";
import { useState, type PointerEvent } from "react";
import { categoryLabels, serviceFilters, services, type Service, type ServiceCategory } from "@/data/services";
import { servicesSection as copy } from "@/data/shopify";
import { Icon } from "@/components/ui/Icon";
import { useInViewOnce, useRevealOnce } from "@/lib/hooks/useInViewOnce";
import { usePointer } from "@/lib/hooks/usePointer";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./ServiceCard.module.css";

const TILT = 16;
const SPRING = { stiffness: 200, damping: 15 };

/** Glass service card that tilts toward the cursor, with a spotlight following it. */
function ServiceCard({ service, interactive }: { service: Service; interactive: boolean }) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, SPRING);
  const rotateY = useSpring(tiltY, SPRING);

  const onMove = (event: PointerEvent<HTMLElement>) => {
    if (!interactive) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    tiltX.set(-y * TILT);
    tiltY.set(x * TILT);
    event.currentTarget.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
  };

  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.article
      className={clsx("glass glass-sheen h-full min-h-75 rounded-[22px] px-6.5 py-7.5", styles.card)}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="relative flex h-full flex-col gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-lime text-on-lime">
          <Icon name={service.icon} size={26} />
        </span>
        <span className="text-[0.8rem] font-bold text-lime-text">{categoryLabels[service.category]}</span>
        <h3 className="mt-auto text-2xl leading-[1.1]">{service.title}</h3>
        <p className="m-0 text-fg-2">{service.description}</p>
        <ul className="m-0 mt-1 flex list-none flex-wrap gap-1.5 p-0">
          {service.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-line px-2.5 py-1 text-[0.8rem] font-semibold text-fg-2">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

/**
 * Filter tabs over the service cards. Changing the filter reshuffles the grid
 * (Motion layout + AnimatePresence); the cards rise in the first time they're seen.
 */
export function ServicesGrid() {
  const [filter, setFilter] = useState<"all" | ServiceCategory>("all");
  const [revealed, setRevealed] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInViewOnce(scope, { amount: 0.15 });
  const reduced = useReducedMotionSoft();
  const { fine } = usePointer();

  useRevealOnce(inView, () =>
    animate(
      "[data-reveal]",
      reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [120, 0], rotateX: [-25, 0] },
      { duration: reduced ? 0.4 : 1, ease: [0.16, 1, 0.3, 1], delay: stagger(0.12) },
    ).then(() => setRevealed(true)),
  );

  const shown = filter === "all" ? services : services.filter((service) => service.category === filter);

  return (
    <>
      <div role="group" aria-label={copy.filterLabel} className="-mt-5 mb-9 flex flex-wrap gap-2">
        {serviceFilters.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className="min-h-11 rounded-full border-[1.5px] border-line px-5 font-bold text-fg-2 transition-colors duration-250 hover:border-fg-2 hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/*
        Three layers per card so no two animations fight over one element: the outer
        wrapper reshuffles and enters/exits, the middle one plays the first reveal,
        and the card itself tilts.
      */}
      <div ref={scope} className="relative grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((service) => (
            <motion.div
              key={service.title}
              layout
              initial={{ opacity: 0, scale: 0.7, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="perspective-[1000px]"
            >
              <div data-reveal={revealed ? undefined : ""} className="h-full">
                <ServiceCard service={service} interactive={fine && !reduced} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
