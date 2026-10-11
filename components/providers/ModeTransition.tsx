"use client";

import clsx from "clsx";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { modeFromPath, modes, switchLead, type Mode } from "@/config/modes";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";

type ModeTransitionApi = {
  /** The mode the UI should show: the switch target while switching, otherwise the current page. */
  mode: Mode;
  /** The mode of the page actually on screen. */
  currentMode: Mode;
  switchTo: (mode: Mode) => void;
};

const ModeTransitionContext = createContext<ModeTransitionApi | null>(null);

export function useModeTransition() {
  const api = useContext(ModeTransitionContext);
  if (!api) throw new Error("useModeTransition must be used inside <ModeTransition>");
  return api;
}

const EASE = [0.76, 0, 0.24, 1] as const;

const panel: Variants = {
  below: { y: "101%" },
  cover: { y: "0%", transition: { duration: 0.65, ease: EASE } },
  above: { y: "-101%", transition: { duration: 0.7, ease: EASE } },
};

const panelReduced: Variants = {
  below: { opacity: 0 },
  cover: { opacity: 1, transition: { duration: 0.25 } },
  above: { opacity: 0, transition: { duration: 0.25 } },
};

/** How long the panel stays up after the new page is in place. */
const HOLD_MS = 650;
const HOLD_REDUCED_MS = 450;
/** Safety net: reveal the page even if navigation never finishes. */
const GIVE_UP_MS = 8000;

/**
 * Switches between the Shopify and software homes behind a full-screen panel:
 * slide up, change route, jump to the top, hold, slide out through the top.
 */
export function ModeTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentMode = modeFromPath(usePathname());
  const scroll = useSmoothScroll();
  const reduced = useReducedMotionSoft();

  const [target, setTarget] = useState<Mode | null>(null);
  const [covered, setCovered] = useState(false);
  const busy = useRef(false);

  const switchTo = useCallback(
    (next: Mode) => {
      if (busy.current || next === currentMode) return;
      busy.current = true;
      scroll.stop();
      setTarget(next);
    },
    [currentMode, scroll],
  );

  const onPanelAnimationComplete = (variant: unknown) => {
    if (variant !== "cover" || target === null) return;
    setCovered(true);
    router.push(modes[target].path, { scroll: false });
  };

  // Once the new page is behind the panel: jump to the top, hold, then reveal.
  useEffect(() => {
    if (!covered || target === null) return;
    const arrived = currentMode === target;
    if (arrived) scroll.scrollTo(0, { immediate: true, force: true });
    const timer = window.setTimeout(
      () => setTarget(null),
      arrived ? (reduced ? HOLD_REDUCED_MS : HOLD_MS) : GIVE_UP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [covered, target, currentMode, scroll, reduced]);

  const onExitComplete = () => {
    setCovered(false);
    busy.current = false;
    scroll.start();
  };

  const api = useMemo<ModeTransitionApi>(
    () => ({ mode: target ?? currentMode, currentMode, switchTo }),
    [target, currentMode, switchTo],
  );

  return (
    <ModeTransitionContext.Provider value={api}>
      {children}
      <AnimatePresence onExitComplete={onExitComplete}>
        {target && (
          <motion.div
            key="mode-switch"
            aria-hidden="true"
            className={clsx(
              "fixed inset-0 z-96 grid place-items-center",
              target === "software" ? "bg-lime text-on-lime" : "bg-violet text-on-violet",
            )}
            variants={reduced ? panelReduced : panel}
            initial="below"
            animate="cover"
            exit="above"
            onAnimationComplete={onPanelAnimationComplete}
          >
            <motion.div
              className="px-6 text-center"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                reduced
                  ? { duration: 0.2, delay: 0.1 }
                  : { type: "spring", stiffness: 260, damping: 18, delay: 0.5 }
              }
            >
              <span className="mb-2 block font-bold opacity-70">{switchLead}</span>
              <b className="block font-display text-[clamp(2.4rem,8vw,6.4rem)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                {modes[target].switchTitle}
              </b>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModeTransitionContext.Provider>
  );
}
