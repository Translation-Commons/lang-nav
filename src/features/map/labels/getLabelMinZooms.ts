/** A label to place, centred at (x, y) and sized in screen pixels as seen at zoom 1. */
export type LabelCandidate = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * The zoom levels at which new labels may appear, and how far down the priority list each may
 * reach. Without the cap, remote islands get named at world view just because the ocean around
 * them is empty, ahead of crowded but far more important countries.
 */
export const LABEL_ZOOM_STEPS = [
  { zoom: 1, maxRank: 30 },
  { zoom: 1.5, maxRank: 60 },
  { zoom: 2.25, maxRank: 100 },
  { zoom: 3.4, maxRank: 150 },
  { zoom: 5, maxRank: 200 },
  { zoom: 8, maxRank: Infinity },
];

// Breathing room around each label, so neighbouring names don't touch.
const LABEL_GAP_PX = 4;

type Box = { minX: number; minY: number; maxX: number; maxY: number };

/**
 * For each label, the lowest zoom at which it fits without overlapping a higher-priority label
 * and is high enough in the priority order for that zoom. `candidates` must be in priority
 * order. Labels that never fit are left out.
 *
 * Worked out once rather than on every zoom frame: a label appears when the zoom crosses its
 * level and then stays, instead of labels swapping in and out as the user zooms or pans. Zooming
 * in only moves labels further apart, so a label that fits at one step fits at every later one.
 */
export function getLabelMinZooms(candidates: LabelCandidate[]): Map<string, number> {
  const minZooms = new Map<string, number>();

  for (const { zoom, maxRank } of LABEL_ZOOM_STEPS) {
    const placed: Box[] = [];
    const alreadyShown = candidates.filter((c) => minZooms.has(c.id));
    const notYetShown = candidates.filter((c, rank) => rank < maxRank && !minZooms.has(c.id));

    alreadyShown.forEach((c) => placed.push(toBox(c, zoom)));
    for (const candidate of notYetShown) {
      const box = toBox(candidate, zoom);
      if (placed.some((other) => boxesOverlap(box, other))) continue;
      placed.push(box);
      minZooms.set(candidate.id, zoom);
    }
  }

  return minZooms;
}

/** Positions spread out with zoom; label sizes stay the same on screen. */
function toBox({ x, y, width, height }: LabelCandidate, zoom: number): Box {
  const halfWidth = width / 2 + LABEL_GAP_PX / 2;
  const halfHeight = height / 2 + LABEL_GAP_PX / 2;
  return {
    minX: x * zoom - halfWidth,
    minY: y * zoom - halfHeight,
    maxX: x * zoom + halfWidth,
    maxY: y * zoom + halfHeight,
  };
}

function boxesOverlap(a: Box, b: Box): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}
