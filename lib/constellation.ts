import { hexToRgb, rgba, VIOLET, WHITE, type RGB } from "@/lib/workMap/draw";

/**
 * The quiet background behind the whole site: a few small glowing dots that
 * drift and softly shimmer, joined by very light, thin lines while they pass
 * near each other. It moves a little slower than the page as you scroll.
 * Kept faint on purpose; the content always sits clearly in front of it.
 */

export type Constellation = NonNullable<ReturnType<typeof createConstellation>>;

type Dot = { x: number; y: number; vx: number; vy: number; depth: number; size: number; phase: number; speed: number };
type Palette = { dot: RGB; glow: RGB; line: RGB; lineAlpha: number; dotAlpha: number };

const TAU = Math.PI * 2;
const LIGHT_QUERY = "(prefers-color-scheme: light)";

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const violet = hexToRgb(style.getPropertyValue("--violet")) ?? VIOLET;
  const dark = !window.matchMedia(LIGHT_QUERY).matches;
  return dark
    ? { dot: WHITE, glow: violet, line: violet, lineAlpha: 0.11, dotAlpha: 0.75 }
    : { dot: violet, glow: violet, line: violet, lineAlpha: 0.09, dotAlpha: 0.55 };
}

/** A soft round glow, drawn once and stamped under every dot. */
function makeGlow(color: RGB) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const context = sprite.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, rgba(color, 0.55));
    gradient.addColorStop(0.4, rgba(color, 0.16));
    gradient.addColorStop(1, rgba(color, 0));
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  return sprite;
}

export function createConstellation(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx = context;

  let width = 0;
  let height = 0;
  let ratio = 1;
  let dots: Dot[] = [];
  let palette = readPalette();
  let glow = makeGlow(palette.glow);
  let reduced = false;
  let frame = 0;
  let last = 0;
  let ticks = 0;

  const makeDot = (): Dot => {
    const angle = Math.random() * TAU;
    const speed = 0.004 + Math.random() * 0.008;
    return {
      x: Math.random(),
      y: Math.random(),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      depth: 0.3 + Math.random() * 0.7,
      size: 0.8 + Math.random() * 1.1,
      phase: Math.random() * TAU,
      speed: 0.6 + Math.random() * 1.2,
    };
  };

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const count = Math.round(Math.min(70, Math.max(26, (width * height) / 24000)));
    while (dots.length < count) dots.push(makeDot());
    dots = dots.slice(0, count);
    requestFrame();
  }

  function draw(now: number, dt: number) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const t = now / 1000;
    const scroll = reduced ? 0 : window.scrollY * 0.06;
    const reach = Math.min(170, Math.max(110, width * 0.13));

    const points = dots.map((dot) => {
      if (!reduced) {
        dot.x = (dot.x + dot.vx * dt + 1) % 1;
        dot.y = (dot.y + dot.vy * dt + 1) % 1;
      }
      const y = (((dot.y * height - scroll * dot.depth) % height) + height) % height;
      return { x: dot.x * width, y };
    });

    // Thin lines between dots that are near each other, fading with distance.
    ctx.lineWidth = 0.7;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[j].x - points[i].x;
        const dy = points[j].y - points[i].y;
        if (Math.abs(dx) > reach || Math.abs(dy) > reach) continue;
        const distance = Math.hypot(dx, dy);
        if (distance >= reach) continue;
        ctx.strokeStyle = rgba(palette.line, (1 - distance / reach) ** 2 * palette.lineAlpha);
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }

    // Dots with a soft glow that swells and fades.
    points.forEach((point, index) => {
      const dot = dots[index];
      const shimmer = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(t * dot.speed + dot.phase);
      const halo = dot.size * (6 + shimmer * 6);
      ctx.globalAlpha = 0.25 + shimmer * 0.55;
      ctx.drawImage(glow, point.x - halo / 2, point.y - halo / 2, halo, halo);
      ctx.globalAlpha = 1;
      ctx.fillStyle = rgba(palette.dot, (0.3 + shimmer * 0.7) * palette.dotAlpha);
      ctx.beginPath();
      ctx.arc(point.x, point.y, dot.size, 0, TAU);
      ctx.fill();
    });
  }

  function loop(now: number) {
    frame = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 30;
    ticks++;
    // Slow drift and shimmer look the same at 30fps, for half the work.
    if (ticks % 2 === 0 || reduced) {
      draw(now, dt);
      last = now;
    }
    if (!reduced) frame = requestAnimationFrame(loop);
    else last = 0;
  }

  function requestFrame() {
    if (!frame) frame = requestAnimationFrame(loop);
  }

  const sizer = new ResizeObserver(resize);
  sizer.observe(canvas);
  const scheme = window.matchMedia(LIGHT_QUERY);
  const onScheme = () => {
    palette = readPalette();
    glow = makeGlow(palette.glow);
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
      sizer.disconnect();
      scheme.removeEventListener("change", onScheme);
    },
  };
}
