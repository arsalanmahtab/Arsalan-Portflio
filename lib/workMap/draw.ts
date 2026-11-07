import { storeGradient } from "@/data/projects";
import type { MapThumb } from "@/data/workMap";

/** Colour and drawing helpers shared by the work map section and the site-wide backdrop. */

export type RGB = readonly [number, number, number];
export type Box = { x: number; y: number; w: number; h: number };
export type Camera = { x: number; y: number; scale: number };

export const VIOLET: RGB = [138, 124, 255];
export const HUB: RGB = [108, 128, 255];
export const MINT: RGB = [86, 214, 190];
export const LIME: RGB = [198, 242, 78];
export const WHITE: RGB = [242, 238, 255];
export const MUTED: RGB = [171, 165, 201];
export const FONT = 'ui-monospace, "SFMono-Regular", Consolas, monospace';
const THUMB_COLORS = ["#C6F24E", "#8A7CFF", "#FF9DBB", "#8EE3C8"];

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const rgba = (color: RGB, alpha: number) =>
  `rgba(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
/** "#8a7cff" → [138, 124, 255]; null for anything else. */
export function hexToRgb(hex: string): RGB | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Frame-rate independent ease towards a target. */
export const approach = (value: number, target: number, rate: number, dt: number) =>
  Math.abs(target - value) < 0.001 ? target : value + (target - value) * (1 - Math.exp(-rate * dt));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** A tiny picture centred in `box`: a storefront, a code editor, a chart, a chat or a page. */
export function drawThumb(
  ctx: CanvasRenderingContext2D,
  kind: MapThumb,
  box: Box,
  title: string,
  seed: number,
  alpha: number,
  border: string,
  borderWidth: number,
) {
  const left = box.x - box.w / 2;
  const top = box.y - box.h / 2;
  const { w, h } = box;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#0C0A1A";
  ctx.fillRect(left, top, w, h);
  const pad = Math.max(1.5, w * 0.07);
  const x = left + pad;
  const y = top + pad;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  const vary = (n: number) => 0.45 + (((seed * 37 + n * 61) % 100) / 100) * 0.5;

  switch (kind) {
    case "store": {
      const [from, to] = storeGradient(title);
      const fill = ctx.createLinearGradient(x, y, x + iw, y + ih);
      fill.addColorStop(0, from);
      fill.addColorStop(1, to);
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, iw, ih);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(x, y, iw, ih * 0.12);
      const card = (iw - pad * 4) / 3;
      for (let i = 0; i < 3; i++) ctx.fillRect(x + pad + i * (card + pad), y + ih * 0.5, card, ih * 0.38);
      break;
    }
    case "code": {
      ctx.fillStyle = "#141029";
      ctx.fillRect(x, y, iw, ih);
      const line = ih / 5;
      THUMB_COLORS.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(x + pad + (i % 2) * pad * 1.5, y + line * (i + 0.6), (iw - pad * 3) * vary(i), Math.max(1, line * 0.45));
      });
      break;
    }
    case "chart": {
      ctx.fillStyle = "#141029";
      ctx.fillRect(x, y, iw, ih);
      const bar = (iw - pad) / 5;
      ctx.fillStyle = THUMB_COLORS[0];
      for (let i = 0; i < 5; i++) {
        const barHeight = (ih - pad * 2) * (0.3 + i * 0.15) * (0.85 + vary(i) * 0.25);
        ctx.fillRect(x + pad / 2 + i * bar + bar * 0.18, y + ih - pad - barHeight, bar * 0.64, barHeight);
      }
      break;
    }
    case "chat": {
      ctx.fillStyle = "#F2EEFF";
      ctx.fillRect(x, y, iw, ih);
      ctx.fillStyle = "#D8D2EE";
      ctx.fillRect(x + pad, y + pad, iw * 0.55, ih * 0.28);
      ctx.fillStyle = THUMB_COLORS[1];
      ctx.fillRect(x + iw * 0.38, y + ih * 0.5, iw * 0.55, ih * 0.28);
      break;
    }
    case "page": {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x, y, iw, ih);
      ctx.fillStyle = THUMB_COLORS[1];
      ctx.fillRect(x, y, iw, ih * 0.3);
      ctx.fillStyle = "#D8D2EE";
      ctx.fillRect(x + pad, y + ih * 0.45, iw * 0.7 * vary(1), ih * 0.1);
      ctx.fillRect(x + pad, y + ih * 0.62, iw * 0.5 * vary(2), ih * 0.1);
      ctx.fillStyle = THUMB_COLORS[0];
      ctx.fillRect(x + pad, y + ih * 0.8, iw * 0.3, ih * 0.12);
      break;
    }
  }

  ctx.globalAlpha = 1;
  ctx.strokeStyle = border;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(left - 0.5, top - 0.5, w + 1, h + 1);
}
