import type { MapArea, MapThumb } from "@/data/workMap";

/**
 * Where everything sits on the work map, in world units. Seeded, so the map
 * looks the same on every visit. The world takes the shape of the frame it's
 * drawn in (same area, any width ÷ height), so the map fills wide screens and
 * phones alike.
 */

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export type MapHubPoint = { x: number; y: number; phase: number; leaves: number[] };

export type MapLeafPoint = {
  area: number;
  item: number;
  x: number;
  y: number;
  phase: number;
  thumb: MapThumb | null;
};

export type MapLayout = {
  center: { x: number; y: number };
  bounds: Bounds;
  hubs: MapHubPoint[];
  /** Every item of every area, area by area in data order. */
  leaves: MapLeafPoint[];
  /** Faint lines from an item to the other areas it also belongs to. */
  links: { leaf: number; area: number }[];
  stars: { x: number; y: number; size: number; alpha: number; phase: number }[];
};

/** Thumbnail size in world units. */
export const THUMB_WIDTH = 30;
export const THUMB_HEIGHT = 22;

const TAU = Math.PI * 2;
/** Every layout covers about this many square world units, whatever its shape. */
const WORLD_AREA = 1800 * 1000;
/** Space kept clear between neighbours while relaxing, in world units. */
const DOT_ROOM = 10;
const THUMB_ROOM = 21;

/** Radius of the disc an area's items scatter over, in world units. */
const spreadOf = (count: number) => 50 + Math.sqrt(count) * 26;

/** mulberry32: a small, fast seeded random generator. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<number, MapLayout>();

/**
 * The layout for a frame of this width ÷ height, rounded to a tenth and cached,
 * so every map on the page (the section and the chapter openers) shares it.
 * There's one set of areas on the site, so the ratio is the whole key.
 */
export function layoutFor(areas: readonly MapArea[], aspect: number): MapLayout {
  const bucket = Math.round(Math.min(2.8, Math.max(0.55, aspect)) * 10) / 10;
  let layout = cache.get(bucket);
  if (!layout) {
    layout = layoutMap(areas, bucket);
    cache.set(bucket, layout);
  }
  return layout;
}

function layoutMap(areas: readonly MapArea[], aspect: number): MapLayout {
  // One seed for every shape, so a phone and a wide screen show the same constellation, stretched.
  const random = seeded(7);
  const width = Math.sqrt(WORLD_AREA * aspect);
  const height = Math.sqrt(WORLD_AREA / aspect);
  const center = { x: width / 2, y: height / 2 };
  const margin = 34;

  // Hubs start round the centre, every other one closer in, so the map reads
  // as a constellation rather than a ring; then they're spaced by cluster size.
  // The half-step turn keeps outer hubs at the far left and right, so the map
  // fills its width, and big areas start near the middle where there's room.
  const spreads = areas.map((area) => spreadOf(area.items.length));
  const hubs: MapHubPoint[] = areas.map((area, index) => {
    const angle = ((index + 0.5) / areas.length) * TAU - Math.PI / 2 + (random() - 0.5) * 0.3;
    const reach =
      area.items.length > 16 ? 0.4 + random() * 0.1 : index % 2 === 0 ? 0.84 + random() * 0.14 : 0.5 + random() * 0.18;
    return {
      x: center.x + Math.cos(angle) * width * 0.4 * reach,
      y: center.y + Math.sin(angle) * height * 0.37 * reach,
      phase: random() * TAU,
      leaves: [],
    };
  });
  spaceHubs(hubs, spreads, center, width, height);

  // Items scatter round their hub, evenly by angle, spread over the disc by area.
  const leaves: MapLeafPoint[] = [];
  areas.forEach((area, areaIndex) => {
    const hub = hubs[areaIndex];
    const count = area.items.length;
    const spread = spreads[areaIndex];
    const turn = random() * TAU;
    area.items.forEach((item, itemIndex) => {
      const angle = turn + (itemIndex / count) * TAU + (random() - 0.5) * (TAU / count) * 0.8;
      const distance = spread * (0.35 + 0.65 * Math.sqrt(random()));
      hub.leaves.push(leaves.length);
      leaves.push({
        area: areaIndex,
        item: itemIndex,
        x: hub.x + Math.cos(angle) * distance,
        y: hub.y + Math.sin(angle) * distance,
        phase: random() * TAU,
        thumb: item.thumb ?? null,
      });
    });
  });

  relax(leaves, hubs, width, height, margin);

  const ids = areas.map((area) => area.id);
  const links = leaves.flatMap((leaf, index) =>
    (areas[leaf.area].items[leaf.item].also ?? [])
      .map((id) => ids.indexOf(id))
      .filter((area) => area >= 0 && area !== leaf.area)
      .map((area) => ({ leaf: index, area })),
  );

  const stars = Array.from({ length: 180 }, () => ({
    x: (random() * 1.2 - 0.1) * width,
    y: (random() * 1.2 - 0.1) * height,
    size: 0.8 + random() * 1.4,
    alpha: 0.12 + random() * 0.35,
    phase: random() * TAU,
  }));

  // Bounds of everything drawn, with room for the labels to the right of hubs.
  const bounds: Bounds = { minX: center.x, minY: center.y, maxX: center.x, maxY: center.y };
  const grow = (x: number, y: number, right = 0) => {
    bounds.minX = Math.min(bounds.minX, x - margin);
    bounds.minY = Math.min(bounds.minY, y - margin);
    bounds.maxX = Math.max(bounds.maxX, x + margin + right);
    bounds.maxY = Math.max(bounds.maxY, y + margin);
  };
  hubs.forEach((hub) => grow(hub.x, hub.y, 90));
  leaves.forEach((leaf) => grow(leaf.x, leaf.y));

  return { center, bounds, hubs, leaves, links, stars };
}

/** Pushes hubs apart until neighbouring clusters barely overlap, and off the centre. */
function spaceHubs(hubs: MapHubPoint[], spreads: number[], center: { x: number; y: number }, width: number, height: number) {
  for (let step = 0; step < 200; step++) {
    for (let i = 0; i < hubs.length; i++) {
      const a = hubs[i];
      for (let j = i + 1; j < hubs.length; j++) {
        const b = hubs[j];
        const gap = (spreads[i] + spreads[j]) * 0.85;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        if (distance >= gap) continue;
        const move = ((gap - distance) / distance) * 0.25;
        a.x -= dx * move;
        a.y -= dy * move;
        b.x += dx * move;
        b.y += dy * move;
      }
      const fromCenter = 120 + spreads[i] * 0.4;
      const dx = a.x - center.x;
      const dy = a.y - center.y;
      const distance = Math.hypot(dx, dy) || 0.01;
      if (distance < fromCenter) {
        a.x = center.x + (dx / distance) * fromCenter;
        a.y = center.y + (dy / distance) * fromCenter;
      }
      // Keep most of each cluster inside the map.
      const inset = Math.min(spreads[i] * 0.75, Math.min(width, height) * 0.2);
      a.x = Math.min(width - inset, Math.max(inset, a.x));
      a.y = Math.min(height - inset, Math.max(inset, a.y));
    }
  }
}

/** Pushes overlapping items apart and off other hubs, keeping them inside the map. */
function relax(leaves: MapLeafPoint[], hubs: MapHubPoint[], width: number, height: number, margin: number) {
  const room = (leaf: MapLeafPoint) => (leaf.thumb ? THUMB_ROOM : DOT_ROOM);
  const push = (leaf: MapLeafPoint, fromX: number, fromY: number, gap: number, share: number) => {
    const dx = leaf.x - fromX;
    const dy = leaf.y - fromY;
    const distance = Math.hypot(dx, dy) || 0.01;
    if (distance >= gap) return;
    const move = ((gap - distance) / distance) * share;
    leaf.x += dx * move;
    leaf.y += dy * move;
  };

  for (let step = 0; step < 80; step++) {
    for (let i = 0; i < leaves.length; i++) {
      const a = leaves[i];
      for (let j = i + 1; j < leaves.length; j++) {
        const b = leaves[j];
        const gap = room(a) + room(b);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.abs(dx) >= gap || Math.abs(dy) >= gap) continue;
        const distance = Math.hypot(dx, dy) || 0.01;
        if (distance >= gap) continue;
        const move = ((gap - distance) / distance) * 0.25;
        a.x -= dx * move;
        a.y -= dy * move;
        b.x += dx * move;
        b.y += dy * move;
      }
      hubs.forEach((hub, index) => push(a, hub.x, hub.y, index === a.area ? 26 : 48, 0.5));
      a.x = Math.min(width - margin, Math.max(margin, a.x));
      a.y = Math.min(height - margin, Math.max(margin, a.y));
    }
  }
}
