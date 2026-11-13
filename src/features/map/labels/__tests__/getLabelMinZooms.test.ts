import { describe, expect, it } from 'vitest';

import { getLabelMinZooms, LABEL_ZOOM_STEPS, LabelCandidate } from '../getLabelMinZooms';

function label(id: string, x: number, y = 0, width = 40): LabelCandidate {
  return { id, x, y, width, height: 12 };
}

describe('getLabelMinZooms', () => {
  it('shows labels that fit at world view straight away', () => {
    const minZooms = getLabelMinZooms([label('a', 0), label('b', 200)]);
    expect(minZooms.get('a')).toBe(1);
    expect(minZooms.get('b')).toBe(1);
  });

  it('holds back a lower-priority label until zooming in separates it from a bigger one', () => {
    const minZooms = getLabelMinZooms([label('big', 0), label('small', 30)]);
    expect(minZooms.get('big')).toBe(1);
    expect(minZooms.get('small')).toBeGreaterThan(1);
  });

  it('never shows two overlapping labels at any zoom step', () => {
    // A crowded strip, where most labels have to wait for some zoom before they fit.
    const crowded = Array.from({ length: 40 }, (_, i) => label(`l${i}`, i * 7, (i % 4) * 5));
    const minZooms = getLabelMinZooms(crowded);

    for (const { zoom } of LABEL_ZOOM_STEPS) {
      const shown = crowded.filter((c) => (minZooms.get(c.id) ?? Infinity) <= zoom);
      for (const [i, a] of shown.entries()) {
        for (const b of shown.slice(i + 1)) {
          const apartX = Math.abs(a.x - b.x) * zoom >= (a.width + b.width) / 2;
          const apartY = Math.abs(a.y - b.y) * zoom >= (a.height + b.height) / 2;
          expect(apartX || apartY, `${a.id} and ${b.id} overlap at ${zoom}x`).toBe(true);
        }
      }
    }
  });

  it('names only the top few at world view, even where the map is empty', () => {
    const farApart = Array.from({ length: 40 }, (_, i) => label(`l${i}`, i * 1000));
    const minZooms = getLabelMinZooms(farApart);
    const atWorldView = [...minZooms.values()].filter((zoom) => zoom === 1);
    expect(atWorldView).toHaveLength(LABEL_ZOOM_STEPS[0].maxRank);
    expect(minZooms.get('l39')).toBeGreaterThan(1);
  });

  it('leaves out labels that never fit, even fully zoomed in', () => {
    const minZooms = getLabelMinZooms([label('a', 0), label('same spot', 0)]);
    expect(minZooms.get('a')).toBe(1);
    expect(minZooms.has('same spot')).toBe(false);
  });
});
