"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { workMapAreas as areas, workMapSection as copy } from "@/data/workMap";
import { SplitText } from "@/components/ui/SplitText";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { createMapOpener, type MapOpener } from "@/lib/workMap/opener";
import styles from "./ChapterOpener.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * A full-width band that opens a chapter of the page, like the area intros on
 * Shopify Editions: the work map zoomed in on one area (an id from
 * data/workMap.ts) on the page's own background, with the area's name large in
 * the corner. Decorative; the section after it carries the content.
 */
export function ChapterOpener({ area: id }: { area: string }) {
  const index = areas.findIndex((area) => area.id === id);
  const canvas = useRef<HTMLCanvasElement>(null);
  const opener = useRef<MapOpener | null>(null);
  const reduced = useReducedMotionSoft();

  useEffect(() => {
    if (!canvas.current || index < 0) return;
    const created = createMapOpener(canvas.current, areas, index);
    opener.current = created;
    return () => {
      created?.destroy();
      opener.current = null;
    };
  }, [index]);

  useEffect(() => {
    opener.current?.setReduced(reduced);
  }, [reduced]);

  const area = areas[index];
  if (!area) return null;

  return (
    <div aria-hidden="true" className={styles.opener}>
      <canvas ref={canvas} className={styles.canvas} />
      <div className={clsx("wrap", styles.caption)}>
        <p className={styles.meta}>
          {pad(index + 1)} / {pad(areas.length)} · {area.items.length} {copy.itemsCount}
        </p>
        <SplitText as="p" reveal lines={[area.label]} className={styles.title} />
      </div>
    </div>
  );
}
