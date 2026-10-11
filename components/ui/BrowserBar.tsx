import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  url: string;
  /** Tighter padding for small cards. */
  compact?: boolean;
  /** Extra items on the right, e.g. a bag counter. */
  children?: ReactNode;
};

/** The light top bar of a browser mockup: three dots and an address field. */
export function BrowserBar({ url, compact = false, children }: Props) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 border-b border-[#DDD8F0] bg-[#EEEBF8] text-[#141029]",
        compact ? "px-2.5 py-2" : "px-3.5 py-2.5",
      )}
    >
      <span className="flex gap-1.5" aria-hidden="true">
        <i className="size-2.5 rounded-full bg-[#C9C3E3]" />
        <i className="size-2.5 rounded-full bg-[#C9C3E3]" />
        <i className="size-2.5 rounded-full bg-[#C9C3E3]" />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden rounded-md bg-white px-2.5 py-1 text-[0.8rem] whitespace-nowrap text-[#5d5880]">
        {url}
      </span>
      {children}
    </div>
  );
}
