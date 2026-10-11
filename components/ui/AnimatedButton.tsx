import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "sm";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  /** Plain text label; phase 3 splits it into letters for the rolling hover. */
  children: string;
  className?: string;
};

type LinkProps = BaseProps & {
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, keyof BaseProps | "href">;

type ButtonProps = BaseProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    keyof BaseProps
  >;

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full border-[1.5px] font-bold whitespace-nowrap transition-[color,border-color,scale] duration-[450ms,450ms,200ms] active:scale-95";

const variants: Record<Variant, string> = {
  primary:
    "border-lime bg-lime text-on-lime shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--lime)_70%,transparent)]",
  secondary: "border-fg bg-transparent text-fg hover:border-lime",
};

const sizes: Record<Size, string> = {
  md: "min-h-13 px-6.5",
  sm: "min-h-11 px-5",
};

/**
 * The site's button, rendered as a link when given an href.
 * Phase 3 adds the hover fill, rolling letters, arrow swap, ripple, shimmer and magnetic pull.
 */
export function AnimatedButton({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: LinkProps | ButtonProps) {
  const classes = clsx(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { external, ...rest } = props;
    return (
      <a
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
