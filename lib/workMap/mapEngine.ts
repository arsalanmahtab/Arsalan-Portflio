import type { MapArea } from "@/data/workMap";
import {
  approach,
  clamp01,
  drawThumb,
  easeInOut,
  easeOut,
  FONT,
  HUB,
  LIME,
  MINT,
  mix,
  MUTED,
  rgba,
  VIOLET,
  WHITE,
  type Box,
  type Camera,
} from "./draw";
import { layoutFor, THUMB_HEIGHT, THUMB_WIDTH, type Bounds, type MapLayout } from "./layout";

/**
 * Draws the work map on a 2D canvas and handles pointing at it. React owns the
 * state (which area is zoomed, what's selected) and passes it in; the engine
 * animates towards it and reports hovers and clicks back. The map also reacts
 * physically: nodes lean towards the cursor, and dragging pans it.
 */

/** Nodes within this many px of the cursor lean towards it, by up to MAGNET_PULL px. */
const MAGNET_RADIUS = 140;
const MAGNET_PULL = 16;
/** How far (px) the press has to move before it counts as a drag rather than a click. */
const DRAG_THRESHOLD = 5;

/** An area's hub (`item` null) or one of its items. */
export type MapTarget = { area: number; item: number | null };

/** Space the overlays cover in the zoomed view, in CSS px from each edge. */
export type MapInsets = { top: number; right: number; bottom: number; left: number };

type Options = {
  canvas: HTMLCanvasElement;
  /** Positioned over the hovered or selected item every frame. */
  tooltip: HTMLElement;
  areas: readonly MapArea[];
  centreLabel: string;
  insets: () => MapInsets;
  onHover: (target: MapTarget | null) => void;
  /** A click on a hub or item, or on empty space (null). */
  onActivate: (target: MapTarget | null, viaTouch: boolean) => void;
};

export type WorkMapEngine = ReturnType<typeof createWorkMap>;

const same = (a: MapTarget | null, b: MapTarget | null) => a?.area === b?.area && a?.item === b?.item;

export function createWorkMap(options: Options) {
  const { canvas, tooltip, areas } = options;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx = context;

  let layout: MapLayout | null = null;
  /** Global leaf index of each area's first item (the same in every layout). */
  const offsets = areas.map((_, index) => areas.slice(0, index).reduce((sum, area) => sum + area.items.length, 0));
  const leafIndex = (target: MapTarget | null) => (target && target.item !== null ? offsets[target.area] + target.item : -1);

  let width = 0;
  let height = 0;
  let ratio = 1;
  let camera: Camera = { x: 0, y: 0, scale: 1 };
  let overviewScale = 1;
  let tween: { from: Camera; to: Camera; start: number; duration: number } | null = null;

  let focus: number | null = null;
  let pointerHover: MapTarget | null = null;
  let listHover: MapTarget | null = null;
  let selected: MapTarget | null = null;
  let reduced = false;
  let viaTouch = false;

  // The cursor over the map (for the magnetic lean), a drag in progress, and the glide after one.
  const pointer = { x: 0, y: 0, inside: false };
  let pull = 0;
  let drag: { id: number; startX: number; startY: number; x: number; y: number; at: number; vx: number; vy: number; moved: boolean } | null =
    null;
  let glide = { vx: 0, vy: 0 };
  let suppressClick = false;

  // Animated values, eased towards their targets every frame.
  const glow = areas.map(() => 0);
  const grow = areas.map(() => 0);
  let heat: number[] = [];
  let focusMix = 0;
  let dimLevel = 0;
  let introStart: number | null = null;

  // Screen positions from the last frame, for hit testing.
  const hubBoxes: Box[] = areas.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  const labelBoxes: Box[] = areas.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  let leafBoxes: Box[] = [];
  let hubPoints: { x: number; y: number }[] = areas.map(() => ({ x: 0, y: 0 }));

  let visible = false;
  let frame = 0;
  let last = 0;

  /** The item the tooltip points at: the hovered one, else the selected one. */
  const tipTarget = () => [pointerHover, listHover, selected].find((target) => target && target.item !== null) ?? null;
  const activeTarget = () => pointerHover ?? listHover;

  function fit(bounds: Bounds, box: { left: number; top: number; right: number; bottom: number }, maxScale: number): Camera {
    const boxWidth = Math.max(60, box.right - box.left);
    const boxHeight = Math.max(60, box.bottom - box.top);
    const scale = Math.min(boxWidth / (bounds.maxX - bounds.minX), boxHeight / (bounds.maxY - bounds.minY), maxScale);
    return {
      x: (bounds.minX + bounds.maxX) / 2 - ((box.left + box.right) / 2 - width / 2) / scale,
      y: (bounds.minY + bounds.maxY) / 2 - ((box.top + box.bottom) / 2 - height / 2) / scale,
      scale,
    };
  }

  function areaBounds(area: number): Bounds {
    const current = layout!;
    const hub = current.hubs[area];
    const bounds = { minX: hub.x, minY: hub.y, maxX: hub.x, maxY: hub.y };
    for (const index of hub.leaves) {
      const leaf = current.leaves[index];
      bounds.minX = Math.min(bounds.minX, leaf.x - THUMB_WIDTH);
      bounds.minY = Math.min(bounds.minY, leaf.y - THUMB_WIDTH);
      bounds.maxX = Math.max(bounds.maxX, leaf.x + THUMB_WIDTH);
      bounds.maxY = Math.max(bounds.maxY, leaf.y + THUMB_WIDTH);
    }
    return bounds;
  }

  function targetCamera(): Camera {
    const overview = fit(layout!.bounds, { left: 8, top: 44, right: width - 8, bottom: height - 40 }, Infinity);
    overviewScale = overview.scale;
    if (focus === null) return overview;
    const insets = options.insets();
    return fit(
      areaBounds(focus),
      { left: insets.left + 20, top: insets.top + 12, right: width - insets.right - 20, bottom: height - insets.bottom - 12 },
      overview.scale * 2.6,
    );
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    layout = layoutFor(areas, width / height);
    if (leafBoxes.length !== layout.leaves.length) {
      leafBoxes = layout.leaves.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
      heat = layout.leaves.map(() => 0);
    }
    camera = targetCamera();
    tween = null;
    requestFrame();
  }

  /** Eases every animated value; true while anything is still moving. */
  function update(now: number, dt: number) {
    const active = activeTarget();
    const rate = reduced ? 60 : 9;
    let moving = false;
    const ease = (value: number, target: number, speed = rate) => {
      const next = approach(value, target, speed, dt);
      if (next !== target) moving = true;
      return next;
    };

    areas.forEach((_, area) => {
      const lit = focus === area || active?.area === area || (focus === null && selected?.area === area);
      glow[area] = ease(glow[area], lit ? 1 : 0);
      const big = focus === null && active?.area === area && active.item === null;
      grow[area] = ease(grow[area], big ? 1 : 0, reduced ? 60 : 11);
    });
    const hot = [leafIndex(pointerHover), leafIndex(listHover), leafIndex(selected)];
    for (let index = 0; index < heat.length; index++) {
      heat[index] = ease(heat[index], hot.includes(index) ? 1 : 0, reduced ? 60 : 14);
    }
    focusMix = ease(focusMix, focus === null ? 0 : 1, reduced ? 60 : 3.2);
    dimLevel = ease(dimLevel, focus !== null ? 0.8 : active ? 0.55 : 0);

    if (tween) {
      const progress = clamp01((now - tween.start) / tween.duration);
      const eased = easeInOut(progress);
      camera = {
        x: tween.from.x + (tween.to.x - tween.from.x) * eased,
        y: tween.from.y + (tween.to.y - tween.from.y) * eased,
        scale: tween.from.scale * (tween.to.scale / tween.from.scale) ** eased,
      };
      if (progress >= 1) tween = null;
      else moving = true;
    }

    // Keeps gliding after a drag is let go, slowing down.
    if (!drag && Math.hypot(glide.vx, glide.vy) > 4) {
      camera = { ...camera, x: camera.x - (glide.vx * dt) / camera.scale, y: camera.y - (glide.vy * dt) / camera.scale };
      keepInBounds();
      const slow = Math.exp(-7 * dt);
      glide = { vx: glide.vx * slow, vy: glide.vy * slow };
      moving = true;
    }
    pull = ease(pull, pointer.inside && !drag?.moved && !reduced ? 1 : 0, 6);
    return moving;
  }

  /** Stops a pan from losing the map: the view's centre stays over its middle part. */
  function keepInBounds() {
    if (!layout) return;
    const { bounds } = layout;
    const insetX = (bounds.maxX - bounds.minX) * 0.22;
    const insetY = (bounds.maxY - bounds.minY) * 0.22;
    camera.x = Math.min(bounds.maxX - insetX, Math.max(bounds.minX + insetX, camera.x));
    camera.y = Math.min(bounds.maxY - insetY, Math.max(bounds.minY + insetY, camera.y));
  }

  /** Moves a screen point towards the cursor, more the nearer it is, never past it. */
  function lean(point: { x: number; y: number }, strength: number) {
    if (pull < 0.01) return;
    const dx = pointer.x - point.x;
    const dy = pointer.y - point.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= MAGNET_RADIUS || distance < 0.5) return;
    const move = Math.min((1 - distance / MAGNET_RADIUS) ** 2 * MAGNET_PULL * strength * pull, distance * 0.35);
    point.x += (dx / distance) * move;
    point.y += (dy / distance) * move;
  }

  /** Eased 0→1 growth of an element, `delay` ms after the map first came into view. */
  function introAt(now: number, delay: number) {
    if (reduced) return 1;
    if (introStart === null) return 0;
    return easeOut(clamp01((now - introStart - delay) / 1100));
  }

  function draw(now: number) {
    const current = layout;
    if (!current) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const drift = reduced ? 0 : 1;
    const zoom = camera.scale / overviewScale;
    const sizeBoost = Math.min(1.7, Math.sqrt(zoom));
    const edgeBase = mix(VIOLET, WHITE, focusMix);
    const nearBase = mix(MINT, WHITE, focusMix);
    const toX = (x: number) => (x - camera.x) * camera.scale + width / 2;
    const toY = (y: number) => (y - camera.y) * camera.scale + height / 2;
    const fade = (area: number) => 1 - dimLevel * (1 - glow[area]);
    /** Edges of the zoomed area stay white; only hovered items turn lime there. */
    const edgeGlow = (area: number) => glow[area] * (focus === area ? 1 - focusMix : 1);
    const t = now / 1000;

    // Star dust.
    for (const star of current.stars) {
      const x = toX(star.x);
      const y = toY(star.y);
      if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;
      const twinkle = drift ? 0.7 + 0.3 * Math.sin(t * 1.3 + star.phase) : 1;
      ctx.fillStyle = rgba(WHITE, star.alpha * twinkle * (0.55 + 0.45 * focusMix));
      ctx.fillRect(x, y, star.size, star.size);
    }

    // World positions this frame: hubs grow out of the centre, items out of their hub.
    const centreX = toX(current.center.x);
    const centreY = toY(current.center.y);
    hubPoints = current.hubs.map((hub, area) => {
      const grown = introAt(now, area * 70);
      const x = current.center.x + (hub.x - current.center.x) * grown + Math.sin(t * 0.42 + hub.phase) * 4 * drift;
      const y = current.center.y + (hub.y - current.center.y) * grown + Math.cos(t * 0.37 + hub.phase) * 4 * drift;
      return { x, y };
    });
    current.leaves.forEach((leaf, index) => {
      const hub = current.hubs[leaf.area];
      const grown = introAt(now, leaf.area * 70 + 260 + (leaf.item % 12) * 25);
      const x = hubPoints[leaf.area].x + (leaf.x - hub.x) * grown + Math.sin(t * 0.55 + leaf.phase) * 5 * drift;
      const y = hubPoints[leaf.area].y + (leaf.y - hub.y) * grown + Math.cos(t * 0.48 + leaf.phase) * 5 * drift;
      const box = leafBoxes[index];
      box.x = toX(x);
      box.y = toY(y);
      lean(box, 1);
      if (leaf.thumb) {
        box.w = Math.min(58, Math.max(18, THUMB_WIDTH * camera.scale));
        box.h = box.w * (THUMB_HEIGHT / THUMB_WIDTH);
      } else {
        box.w = box.h = 0;
      }
    });
    hubPoints = hubPoints.map((point) => {
      const screen = { x: toX(point.x), y: toY(point.y) };
      lean(screen, 0.5);
      return screen;
    });
    const intro = introAt(now, 0);

    // Centre to hubs.
    hubPoints.forEach((hub, area) => {
      const lit = edgeGlow(area);
      ctx.strokeStyle = rgba(mix(edgeBase, LIME, lit), (0.3 + 0.6 * lit) * fade(area) * intro);
      ctx.lineWidth = 1 + lit * 0.4;
      ctx.beginPath();
      ctx.moveTo(centreX, centreY);
      ctx.lineTo(hub.x, hub.y);
      ctx.stroke();
    });

    // Items to the other areas they belong to.
    ctx.lineWidth = 0.75;
    for (const link of current.links) {
      const leaf = current.leaves[link.leaf];
      const box = leafBoxes[link.leaf];
      const hub = hubPoints[link.area];
      const lit = Math.max(edgeGlow(leaf.area), edgeGlow(link.area), heat[link.leaf]);
      ctx.strokeStyle = rgba(mix(edgeBase, LIME, lit), (0.1 + 0.5 * lit) * Math.min(fade(leaf.area), fade(link.area)) * intro);
      ctx.beginPath();
      ctx.moveTo(box.x, box.y);
      ctx.lineTo(hub.x, hub.y);
      ctx.stroke();
    }

    // Hubs to their items: brighter near the hub, fading out towards the item.
    current.leaves.forEach((leaf, index) => {
      const hub = hubPoints[leaf.area];
      const box = leafBoxes[index];
      const lit = Math.max(edgeGlow(leaf.area), heat[index]);
      const alpha = fade(leaf.area) * intro;
      const gradient = ctx.createLinearGradient(hub.x, hub.y, box.x, box.y);
      gradient.addColorStop(0, rgba(mix(nearBase, LIME, lit), (0.5 + 0.4 * lit) * alpha));
      gradient.addColorStop(1, rgba(mix(edgeBase, LIME, lit), (0.38 + 0.4 * lit) * alpha));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.9 + heat[index] * 0.8;
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(box.x, box.y);
      ctx.stroke();
    });

    // Items: dots turn into rings when their area lights up; thumbnails get a lit frame.
    current.leaves.forEach((leaf, index) => {
      const box = leafBoxes[index];
      const alpha = fade(leaf.area) * intro;
      const hot = heat[index];
      const ring = glow[leaf.area];
      if (leaf.thumb) {
        const item = areas[leaf.area].items[leaf.item];
        const lit = Math.max(edgeGlow(leaf.area), hot);
        drawThumb(ctx, leaf.thumb, box, item.title, index, alpha, rgba(mix(WHITE, LIME, lit), (0.42 + 0.5 * lit) * alpha), 1 + hot);
        return;
      }
      const radius = (2.3 + ring * 2.4 + hot * 2.4) * sizeBoost;
      if (ring < 1) {
        ctx.fillStyle = rgba(mix(mix(VIOLET, WHITE, 0.15 + focusMix * 0.7), LIME, hot), (1 - ring) * alpha);
        ctx.beginPath();
        ctx.arc(box.x, box.y, (2.3 + hot * 2) * sizeBoost, 0, Math.PI * 2);
        ctx.fill();
      }
      if (ring > 0) {
        ctx.strokeStyle = rgba(mix(WHITE, LIME, hot), ring * alpha);
        ctx.lineWidth = 1.2 + hot * 0.6;
        ctx.beginPath();
        ctx.arc(box.x, box.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // The centre.
    ctx.strokeStyle = rgba(edgeBase, 0.85 * intro);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(centreX, centreY, 6 * sizeBoost, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `500 10px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = rgba(MUTED, 0.75 * intro * (1 - focusMix));
    ctx.fillText(options.centreLabel, centreX, centreY + 22);
    ctx.textAlign = "left";

    // Hubs and their labels.
    const compact = width < 640;
    hubPoints.forEach((hub, area) => {
      const lit = glow[area];
      const size = (8 + lit * 2) * Math.min(1.4, sizeBoost);
      ctx.fillStyle = rgba(mix(HUB, LIME, lit), fade(area) * intro);
      ctx.fillRect(hub.x - size / 2, hub.y - size / 2, size, size);
      const hubBox = hubBoxes[area];
      hubBox.x = hub.x;
      hubBox.y = hub.y;
      hubBox.w = hubBox.h = size;

      const labelAlpha = fade(area) * intro * (focus === area ? 1 - focusMix : 1);
      const labelBox = labelBoxes[area];
      if (labelAlpha < 0.02) {
        labelBox.w = 0;
        return;
      }
      const base = compact ? 11 : width >= 1200 ? 14 : 13;
      const fontSize = base + grow[area] * base * 1.2;
      const label = areas[area].label;
      const count = String(areas[area].items.length);
      ctx.font = `500 ${fontSize}px ${FONT}`;
      const labelWidth = ctx.measureText(label).width;
      ctx.font = `500 ${fontSize * 0.68}px ${FONT}`;
      const countWidth = ctx.measureText(count).width;
      const total = labelWidth + 4 + countWidth;
      const gap = 10 + grow[area] * 4;
      const flip = hub.x + gap + total > width - 8;
      const left = flip ? hub.x - gap - total : hub.x + gap;
      const baseline = hub.y - 4 - grow[area] * 2;

      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 6;
      ctx.font = `500 ${fontSize}px ${FONT}`;
      ctx.fillStyle = rgba(WHITE, labelAlpha);
      ctx.fillText(label, left, baseline);
      ctx.font = `500 ${fontSize * 0.68}px ${FONT}`;
      ctx.fillStyle = rgba(MUTED, labelAlpha);
      ctx.fillText(count, left + labelWidth + 4, baseline - fontSize * 0.42);
      ctx.shadowBlur = 0;

      labelBox.x = left;
      labelBox.y = baseline - fontSize;
      labelBox.w = total;
      labelBox.h = fontSize * 1.3;
    });

    placeTooltip();
  }

  function placeTooltip() {
    const target = tipTarget();
    const index = leafIndex(target);
    if (index < 0) return;
    const box = leafBoxes[index];
    const x = Math.min(width - 130, Math.max(130, box.x));
    const above = box.y > 110;
    const offset = (box.h || 8) / 2 + 12;
    tooltip.style.transform = above
      ? `translate3d(${x.toFixed(1)}px, ${(box.y - offset).toFixed(1)}px, 0) translate(-50%, -100%)`
      : `translate3d(${x.toFixed(1)}px, ${(box.y + offset).toFixed(1)}px, 0) translate(-50%, 0)`;
  }

  function hitTest(x: number, y: number): MapTarget | null {
    const slop = viaTouch ? 12 : 5;
    const leafAt = (only: number | null) => {
      let best = -1;
      let bestDistance = Infinity;
      leafBoxes.forEach((box, index) => {
        const leaf = layout!.leaves[index];
        if (only !== null && leaf.area !== only) return;
        const dx = Math.abs(x - box.x);
        const dy = Math.abs(y - box.y);
        const inside = box.w ? dx <= box.w / 2 + slop && dy <= box.h / 2 + slop : Math.hypot(dx, dy) <= 6 + slop;
        const distance = Math.hypot(dx, dy);
        if (inside && distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      });
      return best < 0 ? null : { area: layout!.leaves[best].area, item: layout!.leaves[best].item };
    };
    const hubAt = () => {
      for (let area = areas.length - 1; area >= 0; area--) {
        const hub = hubBoxes[area];
        const label = labelBoxes[area];
        const onHub = Math.abs(x - hub.x) <= hub.w / 2 + slop + 3 && Math.abs(y - hub.y) <= hub.h / 2 + slop + 3;
        const onLabel = label.w > 0 && x >= label.x - 4 && x <= label.x + label.w + 4 && y >= label.y - 4 && y <= label.y + label.h + 4;
        if (onHub || onLabel) return { area, item: null };
      }
      return null;
    };
    // Zoomed in, only the zoomed area's items answer; other areas stay reachable by their hubs.
    if (focus !== null) return leafAt(focus) ?? hubAt();
    return hubAt() ?? leafAt(null);
  }

  function pointAt(event: PointerEvent | MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top] as const;
  }

  function setPointerHover(target: MapTarget | null) {
    if (same(target, pointerHover)) return;
    pointerHover = target;
    canvas.style.cursor = target ? "pointer" : "";
    options.onHover(target);
    requestFrame();
  }

  const onPointerDown = (event: PointerEvent) => {
    viaTouch = event.pointerType !== "mouse";
    suppressClick = false;
    if (event.button !== 0) return;
    const [x, y] = pointAt(event);
    drag = { id: event.pointerId, startX: x, startY: y, x, y, at: event.timeStamp, vx: 0, vy: 0, moved: false };
    glide = { vx: 0, vy: 0 };
  };

  const onPointerMove = (event: PointerEvent) => {
    const [x, y] = pointAt(event);
    if (drag && drag.id === event.pointerId) {
      if (!drag.moved && Math.hypot(x - drag.startX, y - drag.startY) > DRAG_THRESHOLD) {
        drag.moved = true;
        tween = null;
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {}
        canvas.style.cursor = "grabbing";
        setPointerHover(null);
      }
      if (drag.moved) {
        const dx = x - drag.x;
        const dy = y - drag.y;
        const elapsed = Math.max(1, event.timeStamp - drag.at) / 1000;
        // Smoothed speed in px/s, for the glide after letting go.
        drag.vx = drag.vx * 0.6 + (dx / elapsed) * 0.4;
        drag.vy = drag.vy * 0.6 + (dy / elapsed) * 0.4;
        camera = { ...camera, x: camera.x - dx / camera.scale, y: camera.y - dy / camera.scale };
        keepInBounds();
        requestFrame();
      }
      drag.x = x;
      drag.y = y;
      drag.at = event.timeStamp;
      if (drag.moved) return;
    }
    if (event.pointerType !== "mouse") return;
    viaTouch = false;
    pointer.x = x;
    pointer.y = y;
    pointer.inside = true;
    setPointerHover(hitTest(x, y));
    requestFrame();
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) {
      suppressClick = true;
      // Held still before letting go: no glide.
      const held = event.timeStamp - drag.at > 80;
      glide = reduced || held ? { vx: 0, vy: 0 } : { vx: drag.vx * 0.5, vy: drag.vy * 0.5 };
      canvas.style.cursor = "";
      requestFrame();
    }
    drag = null;
  };

  const onPointerLeave = () => {
    pointer.inside = false;
    setPointerHover(null);
    requestFrame();
  };

  const onClick = (event: MouseEvent) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const target = hitTest(...pointAt(event));
    // A click on empty space brings a panned overview back to the centre.
    if (!target && focus === null && layout) {
      tween = { from: camera, to: targetCamera(), start: performance.now(), duration: reduced ? 1 : 700 };
      requestFrame();
    }
    options.onActivate(target, viaTouch);
  };

  function tick(now: number) {
    frame = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const moving = update(now, dt);
    draw(now);
    // The map drifts gently all the time; with reduced motion it only redraws when something changes.
    if (visible && (moving || !reduced)) frame = requestAnimationFrame(tick);
    else last = 0;
  }

  function requestFrame() {
    if (!frame && visible) frame = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      introStart ??= performance.now();
      requestFrame();
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
  });
  observer.observe(canvas);
  const sizer = new ResizeObserver(resize);
  sizer.observe(canvas);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerEnd);
  canvas.addEventListener("pointercancel", onPointerEnd);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("click", onClick);
  resize();

  return {
    setFocus(area: number | null) {
      if (area === focus) return;
      focus = area;
      if (!layout) return;
      tween = { from: camera, to: targetCamera(), start: performance.now(), duration: reduced ? 1 : 1100 };
      requestFrame();
    },
    setListHover(target: MapTarget | null) {
      listHover = target;
      requestFrame();
    },
    setSelected(target: MapTarget | null) {
      selected = target;
      requestFrame();
    },
    setReduced(value: boolean) {
      reduced = value;
      requestFrame();
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerEnd);
      canvas.removeEventListener("pointercancel", onPointerEnd);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
    },
  };
}
