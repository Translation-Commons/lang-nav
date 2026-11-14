const resolvedColors = new Map<string, string>();
let canvasContext: CanvasRenderingContext2D | null | undefined;

function getCanvasContext() {
  if (canvasContext === undefined) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    canvasContext = canvas.getContext('2d', { willReadFrequently: true }) ?? null;
  }
  return canvasContext;
}

/**
 * MapLibre can't parse var() or oklch(), which the app uses, so round-trip the colour through a
 * 1px canvas to get rgba().
 */
export function resolveCssColor(color: string): string {
  const cached = resolvedColors.get(color);
  if (cached) return cached;

  const variableName = color.match(/^var\((--[\w-]+)\)$/)?.[1];
  const value = variableName
    ? getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
    : color;

  const context = getCanvasContext();
  if (!context || !value) return value || color;

  context.clearRect(0, 0, 1, 1);
  // A colour the canvas can't parse is ignored, leaving this transparent fill in place.
  context.fillStyle = 'transparent';
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  const resolved = `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`;

  // Variables change with the theme, and a transparent result may be a colour that failed to
  // parse, so only remember literal colours that came out visible.
  if (!variableName && alpha > 0) resolvedColors.set(color, resolved);
  return resolved;
}
