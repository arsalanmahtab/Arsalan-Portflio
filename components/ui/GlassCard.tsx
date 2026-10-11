import clsx from "clsx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section" | "li" | "aside";
  /** Corner radius in px. */
  radius?: number;
  /** Diagonal light sweep on hover. Turn off when content must overflow the card. */
  sheen?: boolean;
};

/**
 * Frosted glass panel: translucent fill with blur, a 1px edge, an inset top
 * highlight, a soft drop shadow and a light sheen on hover.
 */
export function GlassCard({ as: Tag = "div", radius = 22, sheen = true, className, style, ...rest }: Props) {
  return (
    <Tag
      className={clsx("glass", sheen && "glass-sheen", className)}
      style={{ borderRadius: radius, ...style }}
      {...rest}
    />
  );
}
