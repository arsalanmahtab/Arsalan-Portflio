"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { workMapAreas as areas, workMapSection as copy } from "@/data/workMap";
import { Icon } from "@/components/ui/Icon";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotionSoft } from "@/lib/hooks/useReducedMotionSoft";
import { createWorkMap, type MapTarget, type WorkMapEngine } from "@/lib/workMap/mapEngine";
import styles from "./WorkMap.module.css";

const itemCount = areas.reduce((sum, area) => sum + area.items.length, 0);
const pad = (value: number) => String(value).padStart(2, "0");
const same = (a: MapTarget | null, b: MapTarget | null) => a?.area === b?.area && a?.item === b?.item;

/**
 * The work map itself: the canvas, its overlays, the zoomed area's list and the
 * area buttons under it. The buttons and list are the keyboard and screen
 * reader way through the map; the canvas is a picture of the same content.
 */
export function WorkMapGraph() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const engine = useRef<WorkMapEngine | null>(null);

  const [focus, setFocus] = useState<number | null>(null);
  /** The area the title and list show; stays on the last one while they fade out. */
  const [shownArea, setShownArea] = useState(0);
  const [hover, setHover] = useState<MapTarget | null>(null);
  const [listHover, setListHover] = useState<MapTarget | null>(null);
  const [selected, setSelected] = useState<MapTarget | null>(null);
  const reduced = useReducedMotionSoft();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const titleId = useId();

  const show = (area: number | null, select: MapTarget | null = null) => {
    setFocus(area);
    if (area !== null) setShownArea(area);
    setSelected(select);
    setListHover(null);
  };

  const onHover = useEffectEvent((target: MapTarget | null) => setHover(target));

  const onActivate = useEffectEvent((target: MapTarget | null, viaTouch: boolean) => {
    if (!target) {
      if (focus !== null) show(null);
      return;
    }
    if (target.item === null) {
      if (target.area !== focus) show(target.area);
      return;
    }
    if (target.area !== focus) {
      show(target.area, target);
      return;
    }
    // On touch the first tap shows the item; a second tap on a store opens it.
    const item = areas[target.area].items[target.item];
    if (item.url && (!viaTouch || same(selected, target))) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }
    setSelected(target);
  });

  useEffect(() => {
    if (!canvas.current || !tooltip.current) return;
    const map = createWorkMap({
      canvas: canvas.current,
      tooltip: tooltip.current,
      areas,
      centreLabel: copy.centre,
      // The zoomed area is framed in the space the bar, title and side panel leave free.
      insets: () => {
        const panelEl = panel.current;
        const overlay = panelEl !== null && getComputedStyle(panelEl).position === "absolute";
        return {
          top: bar.current ? bar.current.offsetTop + bar.current.offsetHeight : 0,
          right: overlay && frame.current ? frame.current.clientWidth - panelEl.offsetLeft : 0,
          bottom: title.current ? title.current.offsetHeight + 24 : 0,
          left: 0,
        };
      },
      onHover: (target) => onHover(target),
      onActivate: (target, viaTouch) => onActivate(target, viaTouch),
    });
    engine.current = map;
    return () => {
      map?.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setReduced(reduced);
  }, [reduced]);

  useEffect(() => {
    engine.current?.setFocus(focus);
  }, [focus]);

  useEffect(() => {
    engine.current?.setListHover(listHover);
  }, [listHover]);

  useEffect(() => {
    engine.current?.setSelected(selected);
  }, [selected]);

  const open = focus !== null;
  const area = areas[shownArea];
  const tip = [hover, listHover, selected].find((target) => target && target.item !== null) ?? null;
  const tipItem = tip && tip.item !== null ? areas[tip.area].items[tip.item] : null;
  const visitHint = tipItem?.url && tip?.area === focus ? (finePointer ? copy.visitHint.pointer : copy.visitHint.touch) : null;
  const step = (by: number) => show(((focus ?? 0) + by + areas.length) % areas.length);
  const rise = reduced ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : { initial: { y: "105%" }, animate: { y: "0%" } };

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) show(null);
      }}
    >
      <div
        ref={frame}
        className={styles.frame}
        style={{ backgroundColor: focus !== null ? areas[focus].color : undefined }}
      >
        <div className={styles.stage}>
          <canvas ref={canvas} role="img" aria-label={copy.label} className={styles.canvas} />

          <div ref={tooltip} aria-hidden="true" className={styles.tooltip} data-show={tipItem !== null}>
            {tipItem && (
              <>
                <b>{tipItem.title}</b>
                <span>{tipItem.text}</span>
                {visitHint && <em>{visitHint}</em>}
              </>
            )}
          </div>

          <div ref={bar} className={styles.bar}>
            {open ? (
              <>
                <button type="button" className={clsx(styles.control, styles.mono)} onClick={() => show(null)}>
                  <Icon name="chevronLeft" size={16} strokeWidth={2.4} />
                  {copy.back}
                </button>
                <button
                  type="button"
                  aria-label={copy.previous}
                  className={clsx(styles.control, styles.round)}
                  onClick={() => step(-1)}
                >
                  <Icon name="chevronLeft" size={16} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  aria-label={copy.next}
                  className={clsx(styles.control, styles.round)}
                  onClick={() => step(1)}
                >
                  <Icon name="chevronRight" size={16} strokeWidth={2.4} />
                </button>
              </>
            ) : (
              <p className={clsx(styles.stats, styles.mono)}>
                <b>{pad(areas.length)}</b> {copy.areasCount} · <b>{itemCount}</b> {copy.itemsCount}
              </p>
            )}
          </div>

          <p aria-hidden="true" className={clsx(styles.hint, styles.mono)} data-hidden={open}>
            {finePointer ? copy.hint.pointer : copy.hint.touch}
          </p>

          <div ref={title} className={styles.title} data-open={open} inert={!open}>
            <p className={clsx(styles.titleMeta, styles.mono)}>
              {pad(shownArea + 1)} / {pad(areas.length)} · {area.items.length} {copy.itemsCount}
            </p>
            <h3 id={titleId} className={styles.titleText}>
              <motion.span
                key={focus ?? "closed"}
                className="block"
                {...rise}
                transition={{ duration: reduced ? 0.3 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : 0.2 }}
              >
                {area.label}
              </motion.span>
            </h3>
          </div>
        </div>

        <aside ref={panel} aria-labelledby={titleId} className={styles.panel} data-open={open} inert={!open}>
          <p className={styles.summary}>{area.summary}</p>
          <p className={clsx(styles.listLabel, styles.mono)}>{copy.itemsLabel}</p>
          <motion.ul
            key={focus ?? "closed"}
            data-lenis-prevent=""
            className={styles.list}
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : 0.15 }}
          >
            {area.items.map((item, index) => {
              const target = { area: shownArea, item: index };
              const enter = () => setListHover(target);
              const leave = () => setListHover(null);
              return (
                <li
                  key={item.title}
                  className={styles.item}
                  data-active={same(tip, target)}
                  onPointerEnter={enter}
                  onPointerLeave={leave}
                >
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className={styles.itemAction} onFocus={enter} onBlur={leave}>
                      {item.title}
                      <Icon name="arrowUpRight" size={14} strokeWidth={2.4} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      aria-pressed={same(selected, target)}
                      className={styles.itemAction}
                      onClick={() => setSelected(same(selected, target) ? null : target)}
                      onFocus={enter}
                      onBlur={leave}
                    >
                      {item.title}
                    </button>
                  )}
                  <small>{item.text}</small>
                </li>
              );
            })}
          </motion.ul>
        </aside>
      </div>

      <nav aria-label={copy.areasLabel}>
        <ul className={styles.chips}>
          {areas.map((entry, index) => {
            const target = { area: index, item: null };
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  aria-pressed={focus === index}
                  className={clsx(styles.chip, styles.mono)}
                  data-lit={hover?.area === index}
                  onClick={() => show(focus === index ? null : index)}
                  onPointerEnter={() => setListHover(target)}
                  onPointerLeave={() => setListHover(null)}
                  onFocus={() => setListHover(target)}
                  onBlur={() => setListHover(null)}
                >
                  <span className={styles.chipIndex}>{pad(index + 1)}</span>
                  {entry.label}
                  <sup>{entry.items.length}</sup>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
