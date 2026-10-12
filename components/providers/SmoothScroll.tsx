"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

type ScrollTarget = number | string | HTMLElement;

type ScrollOptions = {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  /** Scroll even while scrolling is stopped (for example behind a dialog). */
  force?: boolean;
};

export type SmoothScrollApi = {
  /** The live Lenis instance, or null when reduced motion turned smoothing off. */
  getLenis: () => Lenis | null;
  scrollTo: (target: ScrollTarget, options?: ScrollOptions) => void;
  /** Scroll to the visible section with this id and move keyboard focus to it. False if there is none. */
  goTo: (id: string) => boolean;
  /** Lock page scrolling, for example while a dialog is open. */
  stop: () => void;
  /** Unlock page scrolling again. */
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll() {
  const api = useContext(SmoothScrollContext);
  if (!api) throw new Error("useSmoothScroll must be used inside <SmoothScroll>");
  return api;
}

const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]";

/**
 * The visible element with this id. Next.js keeps the previous home mounted but
 * hidden, so both homes can have a #contact in the document at the same time.
 */
function findVisibleById(id: string) {
  const matches = document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  return Array.from(matches).find((element) => element.getClientRects().length > 0) ?? null;
}

/**
 * Lenis smooth scrolling, driven by the GSAP ticker and synced with ScrollTrigger.
 * Turned off for visitors who prefer reduced motion; the API then falls back to
 * native, instant scrolling so callers never need to check.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionSoft();
  const lenisRef = useRef<Lenis | null>(null);

  const api = useMemo<SmoothScrollApi>(() => {
    const scrollTo: SmoothScrollApi["scrollTo"] = (
      target,
      { offset = 0, immediate = false, duration, force } = {},
    ) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset, immediate, duration, force });
        return;
      }
      const element =
        typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (element === null) return;
      const top =
        typeof element === "number" ? element : element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + offset, behavior: "instant" });
    };

    return {
      getLenis: () => lenisRef.current,
      scrollTo,
      goTo: (id) => {
        const target = findVisibleById(id);
        if (!target) return false;
        scrollTo(target);
        if (!target.matches(FOCUSABLE)) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        return true;
      },
      stop: () => {
        if (lenisRef.current) lenisRef.current.stop();
        else document.documentElement.style.overflow = "hidden";
      },
      start: () => {
        if (lenisRef.current) lenisRef.current.start();
        else document.documentElement.style.overflow = "";
      },
    };
  }, []);

  // Lenis on the GSAP ticker, so smooth scroll and ScrollTrigger share one frame loop.
  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ lerp: 0.09 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // In-page anchor links scroll through Lenis (or jump natively with reduced motion),
  // always to the visible target, and focus follows for keyboard users.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest("a[href*='#']");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target && link.target !== "_self") return;

      const url = new URL(link.href);
      const samePage =
        url.origin === location.origin &&
        url.pathname === location.pathname &&
        url.search === location.search;
      if (!samePage || url.hash.length < 2) return;

      const id = decodeURIComponent(url.hash.slice(1));
      if (id === "top") {
        event.preventDefault();
        api.scrollTo(0);
        return;
      }

      if (api.goTo(id)) event.preventDefault();
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [api]);

  // Re-measure every ScrollTrigger once fonts have loaded and whenever the page height changes.
  useEffect(() => {
    let timer = 0;
    let lastHeight = -1;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };

    const observer = new ResizeObserver(([entry]) => {
      const height = Math.round(entry.contentRect.height);
      if (height === lastHeight) return;
      const firstReading = lastHeight === -1;
      lastHeight = height;
      if (!firstReading) refresh();
    });
    observer.observe(document.body);

    let active = true;
    document.fonts?.ready.then(() => {
      if (active) refresh();
    });

    return () => {
      active = false;
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
