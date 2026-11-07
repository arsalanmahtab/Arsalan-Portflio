import type { MapArea } from "@/data/workMap";
import { clamp01, drawThumb, hexToRgb, LIME, rgba, VIOLET, WHITE, type Box, type Camera, type RGB } from "./draw";
import { layoutFor, THUMB_HEIGHT, THUMB_WIDTH, type MapLayout } from "./layout";

/**
 * The picture in a chapter opener: the work map zoomed in on one area, drawn in
 * the theme's colours straight on the page background. While it's on screen
 * the map drifts, small pulses run out along the area's lines, and as it
 * scrolls past the camera eases in a little closer and the map slides up, as if
 * the page scrolls across it.
 */

export type MapOpener = NonNullable<ReturnType<typeof createMapOpener>>;

/** `ink` for the map itself, `accent` for the opened area's hub and pulses. */
type Palette = { ink: RGB; accent: RGB };

const TAU = Math.PI * 2;
const LIGHT_QUERY = "(prefers-color-scheme: light)";

/** Theme colours from the CSS tokens: light lines and lime on dark, dark lines and violet on light. */
function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: RGB) => hexToRgb(style.getPropertyValue(name)) ?? fallback;
  const dark = !window.matchMedia(LIGHT_QUERY).matches;
  return { ink: read("--fg", WHITE), accent: dark ? read("--lime", LIME) : read("--violet", VIOLET) };
}

export function createMapOpener(canvas: HTMLCanvasElement, areas: readonly MapArea[], area: number) {
  const context = canvas.getContext("2d");
  if (!context || !areas[area]) return null;
  const ctx = context;

  let palette = readPalette();
  let layout: MapLayout | null = null;
  let width = 0;
  let height = 0;
  let ratio = 1;
  let overviewScale = 1;
  let reduced = false;
  let visible = false;
  let frame = 0;
  let hubPoints: { x: number; y: number }[] = [];
  let leafBoxes: Box[] = [];

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    layout = layoutFor(areas, width / height);
    hubPoints = layout.hubs.map(() => ({ x: 0, y: 0 }));
    leafBoxes = layout.leaves.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
    const { bounds } = layout;
    overviewScale = Math.min(width / (bounds.maxX - bounds.minX), height / (bounds.maxY - bounds.minY));
    requestFrame();
  }

  /** 0 as the band enters at the bottom of the screen, 1 as it leaves at the top. */
  function progress() {
    const box = canvas.getBoundingClientRect();
    return clamp01((window.innerHeight - box.top) / (window.innerHeight + box.height));
  }

  /** The area's hub sits right of centre, clear of the title in the bottom-left corner. */
  function camera(): Camera {
    const current = layout!;
    const p = reduced ? 0.5 : progress();
    const compact = width < 700;
    const hub = current.hubs[area];
    const scale = overviewScale * (compact ? 2.2 : 2.4) * (1 + 0.16 * p);
    const anchorX = width * (compact ? 0.62 : 0.66);
    const anchorY = height * (compact ? 0.36 : 0.38);
    return {
      x: hub.x - (anchorX - width / 2) / scale,
      y: hub.y + (p - 0.5) * 140 - (anchorY - height / 2) / scale,
      scale,
    };
  }

  function draw(now: number) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!layout) return;
    const current = layout;
    const view = camera();
    const t = now / 1000;
    const drift = reduced ? 0 : 1;
    const toX = (x: number) => (x - view.x) * view.scale + width / 2;
    const toY = (y: number) => (y - view.y) * view.scale + height / 2;
    const onScreen = (box: Box) => box.x > -box.w - 20 && box.y > -box.h - 20 && box.x < width + box.w + 20 && box.y < height + box.h + 20;

    current.hubs.forEach((hub, index) => {
      hubPoints[index].x = toX(hub.x + Math.sin(t * 0.35 + hub.phase) * 4 * drift);
      hubPoints[index].y = toY(hub.y + Math.cos(t * 0.3 + hub.phase) * 4 * drift);
    });
    const thumbWidth = Math.min(54, Math.max(16, THUMB_WIDTH * view.scale));
    current.leaves.forEach((leaf, index) => {
      const box = leafBoxes[index];
      box.x = toX(leaf.x + Math.sin(t * 0.45 + leaf.phase) * 5 * drift);
      box.y = toY(leaf.y + Math.cos(t * 0.4 + leaf.phase) * 5 * drift);
      box.w = leaf.thumb ? thumbWidth : 0;
      box.h = leaf.thumb ? thumbWidth * (THUMB_HEIGHT / THUMB_WIDTH) : 0;
    });
    const hub = hubPoints[area];
    const centreX = toX(current.center.x);
    const centreY = toY(current.center.y);

    // Shimmering star dust.
    for (const star of current.stars) {
      const x = toX(star.x);
      const y = toY(star.y);
      if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;
      const shimmer = drift ? 0.55 + 0.45 * Math.sin(t * 1.4 + star.phase * 3) : 0.8;
      ctx.fillStyle = rgba(palette.ink, star.alpha * shimmer);
      ctx.fillRect(x, y, star.size, star.size);
    }

    // The rest of the map, faint.
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.ink, 0.1);
    ctx.beginPath();
    hubPoints.forEach((point, index) => {
      if (index === area) return;
      ctx.moveTo(centreX, centreY);
      ctx.lineTo(point.x, point.y);
    });
    current.leaves.forEach((leaf, index) => {
      if (leaf.area === area) return;
      ctx.moveTo(hubPoints[leaf.area].x, hubPoints[leaf.area].y);
      ctx.lineTo(leafBoxes[index].x, leafBoxes[index].y);
    });
    ctx.stroke();

    // This area's lines, and its links to the other areas.
    ctx.strokeStyle = rgba(palette.ink, 0.24);
    ctx.beginPath();
    for (const link of current.links) {
      if (link.area !== area && current.leaves[link.leaf].area !== area) continue;
      ctx.moveTo(leafBoxes[link.leaf].x, leafBoxes[link.leaf].y);
      ctx.lineTo(hubPoints[link.area].x, hubPoints[link.area].y);
    }
    ctx.moveTo(centreX, centreY);
    ctx.lineTo(hub.x, hub.y);
    ctx.stroke();
    ctx.strokeStyle = rgba(palette.ink, 0.45);
    ctx.beginPath();
    for (const index of current.hubs[area].leaves) {
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(leafBoxes[index].x, leafBoxes[index].y);
    }
    ctx.stroke();

    // Pulses running out from the hub along its lines.
    if (drift) {
      ctx.fillStyle = rgba(palette.accent, 0.95);
      current.hubs[area].leaves.forEach((index) => {
        const leaf = current.leaves[index];
        const along = (t * 0.22 + leaf.phase / TAU) % 1;
        const box = leafBoxes[index];
        const fade = Math.sin(along * Math.PI);
        ctx.globalAlpha = fade;
        ctx.beginPath();
        ctx.arc(hub.x + (box.x - hub.x) * along, hub.y + (box.y - hub.y) * along, 1.6, 0, TAU);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Dots: the rest faint, this area's bright.
    ctx.fillStyle = rgba(palette.ink, 0.3);
    ctx.beginPath();
    current.leaves.forEach((leaf, index) => {
      if (leaf.thumb || leaf.area === area) return;
      const box = leafBoxes[index];
      ctx.moveTo(box.x + 1.6, box.y);
      ctx.arc(box.x, box.y, 1.6, 0, TAU);
    });
    ctx.fill();
    ctx.fillStyle = rgba(palette.ink, 0.92);
    ctx.beginPath();
    for (const index of current.hubs[area].leaves) {
      if (current.leaves[index].thumb) continue;
      const box = leafBoxes[index];
      ctx.moveTo(box.x + 2.6, box.y);
      ctx.arc(box.x, box.y, 2.6, 0, TAU);
    }
    ctx.fill();

    // Thumbnails.
    current.leaves.forEach((leaf, index) => {
      const box = leafBoxes[index];
      if (!leaf.thumb || !onScreen(box)) return;
      const own = leaf.area === area;
      const title = areas[leaf.area].items[leaf.item].title;
      drawThumb(ctx, leaf.thumb, box, title, index, own ? 0.95 : 0.22, rgba(palette.ink, own ? 0.7 : 0.16), 1);
    });

    // Hubs, with a soft pulse round this one.
    ctx.fillStyle = rgba(palette.ink, 0.32);
    hubPoints.forEach((point, index) => {
      if (index !== area) ctx.fillRect(point.x - 2.5, point.y - 2.5, 5, 5);
    });
    ctx.fillStyle = rgba(palette.accent, 1);
    ctx.fillRect(hub.x - 4.5, hub.y - 4.5, 9, 9);
    const pulse = drift ? (t * 0.6) % 1 : 0.4;
    ctx.strokeStyle = rgba(palette.accent, 0.55 * (1 - pulse));
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 8 + pulse * 22, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = rgba(palette.ink, 0.25);
    ctx.beginPath();
    ctx.arc(centreX, centreY, 5, 0, TAU);
    ctx.stroke();
  }

  function loop(now: number) {
    frame = 0;
    draw(now);
    if (visible && !reduced) frame = requestAnimationFrame(loop);
  }

  function requestFrame() {
    if (!frame && visible) frame = requestAnimationFrame(loop);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestFrame();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(canvas);
  const sizer = new ResizeObserver(resize);
  sizer.observe(canvas);
  const scheme = window.matchMedia(LIGHT_QUERY);
  const onScheme = () => {
    palette = readPalette();
    requestFrame();
  };
  scheme.addEventListener("change", onScheme);
  resize();

  return {
    setReduced(value: boolean) {
      reduced = value;
      requestFrame();
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizer.disconnect();
      scheme.removeEventListener("change", onScheme);
    },
  };
}
