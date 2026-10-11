"use client";

import clsx from "clsx";
import { animate, motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import {
  useRef,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { usePointer } from "@/lib/hooks/usePointer";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import styles from "./AnimatedButton.module.css";

type Variant = "primary" | "secondary" | "onViolet";
type Size = "md" | "sm";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  /** Plain text label; it is split into letters for the rolling hover. */
  children: string;
  className?: string;
  /** Pull toward the cursor on desktop. */
  magnetic?: boolean;
};

type LinkProps = BaseProps & {
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
} & Omit<HTMLMotionProps<"a">, keyof BaseProps | "href" | "ref">;

type ButtonProps = BaseProps & { href?: undefined } & Omit<
    HTMLMotionProps<"button">,
    keyof BaseProps | "ref"
  >;

/** Magnetic pull: 30% of the horizontal and 35% of the vertical offset, with an elastic return. */
const PULL = { x: 0.3, y: 0.35 };
const SPRING = { stiffness: 170, damping: 11, mass: 0.6 };

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M6 18L18 6M9 6h9v9" />
    </svg>
  );
}

/**
 * The site's button (section 5), rendered as a link when given an href.
 * Hover: a fill circle grows from the entry point, the label rolls letter by
 * letter and the arrow swaps. Click: ripple and press. Primary buttons shimmer
 * when idle; on desktop every button is magnetic. Motion handles the gestures,
 * press, pull and ripple; CSS transitions handle the letters and the fill.
 */
export function AnimatedButton({
  variant = "secondary",
  size = "md",
  className,
  children: label,
  magnetic = true,
  ...props
}: LinkProps | ButtonProps) {
  const root = useRef<HTMLElement>(null);
  const ripples = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionSoft();
  const { fine } = usePointer();
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const x = useSpring(pullX, SPRING);
  const y = useSpring(pullY, SPRING);
  const canPull = magnetic && fine && !reduced;

  /** Place the fill circle at a point inside the button, sized to 2.2× the diagonal. */
  const placeFill = (clientX?: number, clientY?: number) => {
    const el = root.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const px = clientX === undefined ? box.width / 2 : clientX - box.left;
    const py = clientY === undefined ? box.height / 2 : clientY - box.top;
    el.style.setProperty("--bx", `${px}px`);
    el.style.setProperty("--by", `${py}px`);
    el.style.setProperty("--bd", `${Math.hypot(box.width, box.height) * 2.2}px`);
  };

  const setHover = (on: boolean) => {
    if (root.current) root.current.dataset.hover = String(on);
  };

  const onHoverStart = (event: globalThis.MouseEvent) => {
    placeFill(event.clientX, event.clientY);
    setHover(true);
  };

  const onHoverEnd = (event: globalThis.MouseEvent) => {
    placeFill(event.clientX, event.clientY);
    setHover(false);
    pullX.set(0);
    pullY.set(0);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!canPull || event.pointerType === "touch" || !root.current) return;
    // Measure from the button's resting position, not where the pull has moved it.
    const box = root.current.getBoundingClientRect();
    const centerX = box.left + box.width / 2 - x.get();
    const centerY = box.top + box.height / 2 - y.get();
    pullX.set((event.clientX - centerX) * PULL.x);
    pullY.set((event.clientY - centerY) * PULL.y);
  };

  // Keyboard focus gets the same hover treatment, growing from the centre.
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.matches(":focus-visible")) return;
    placeFill();
    setHover(true);
  };

  const onBlur = () => setHover(false);

  const ripple = (event: MouseEvent<HTMLElement>) => {
    const host = ripples.current;
    const el = root.current;
    if (reduced || !host || !el) return;
    const box = el.getBoundingClientRect();
    // detail is 0 for keyboard activation: ripple from the centre.
    const fromPointer = event.detail > 0;
    const dot = document.createElement("span");
    dot.className = styles.ripple;
    dot.style.left = `${fromPointer ? event.clientX - box.left : box.width / 2}px`;
    dot.style.top = `${fromPointer ? event.clientY - box.top : box.height / 2}px`;
    host.appendChild(dot);
    animate(dot, { scale: [0, 16], opacity: [0.35, 0] }, { duration: 0.65, ease: "easeOut" }).then(() =>
      dot.remove(),
    );
  };

  const glyphs = Array.from(label, (char) => (char === " " ? " " : char));

  const content = (
    <>
      <span aria-hidden="true" className={styles.fill} />
      <span aria-hidden="true" className={styles.roll}>
        <span className={styles.copy}>
          {glyphs.map((glyph, index) => (
            <span key={index} className={styles.char} style={{ "--i": index } as CSSProperties}>
              {glyph}
            </span>
          ))}
        </span>
        {/* Drawn with generated content (data-char), so crawlers read the label once. */}
        <span className={styles.copy}>
          {glyphs.map((glyph, index) => (
            <span key={index} className={styles.char} style={{ "--i": index } as CSSProperties} data-char={glyph} />
          ))}
        </span>
      </span>
      <span aria-hidden="true" className={styles.arrow}>
        <Arrow />
        <Arrow />
      </span>
      <span ref={ripples} aria-hidden="true" className={styles.ripples} />
    </>
  );

  const shared = {
    className: clsx(styles.button, styles[variant], styles[size], className),
    style: { x, y },
    whileTap: { scale: 0.95 },
    onHoverStart,
    onHoverEnd,
    onPointerMove,
    onFocus,
    onBlur,
  };

  if (props.href !== undefined) {
    const { external, onClick, ...rest } = props;
    return (
      <motion.a
        ref={root as RefObject<HTMLAnchorElement>}
        {...rest}
        {...shared}
        aria-label={external ? `${label} (opens in a new tab)` : label}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={(event) => {
          ripple(event);
          onClick?.(event);
        }}
      >
        {content}
      </motion.a>
    );
  }

  const { onClick, type = "button", ...rest } = props;
  return (
    <motion.button
      ref={root as RefObject<HTMLButtonElement>}
      type={type}
      {...rest}
      {...shared}
      aria-label={label}
      onClick={(event) => {
        ripple(event);
        onClick?.(event);
      }}
    >
      {content}
    </motion.button>
  );
}
