// Average glyph width relative to font size, for when the browser can't measure (e.g. tests).
const AVERAGE_CHAR_WIDTH = 0.6;

let context: CanvasRenderingContext2D | null | undefined;

function getMeasuringContext(): CanvasRenderingContext2D | null {
  if (context === undefined) {
    try {
      context = document.createElement('canvas').getContext('2d') ?? null;
    } catch {
      context = null;
    }
  }
  return context;
}

/** Width in pixels of `text` rendered in the page's own font at the given size and weight. */
export function measureLabelText(text: string, fontPx: number, fontWeight: number): number {
  const ctx = getMeasuringContext();
  if (!ctx) return text.length * fontPx * AVERAGE_CHAR_WIDTH;

  const fontFamily = getComputedStyle(document.body).fontFamily || 'sans-serif';
  ctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
  return ctx.measureText(text).width;
}
