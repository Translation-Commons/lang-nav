const ROBINSON_TABLE = [
  [0.0, 0.0],
  [0.062, 0.062],
  [0.124, 0.124],
  [0.186, 0.186],
  [0.248, 0.248],
  [0.31, 0.31],
  [0.372, 0.372],
  [0.434, 0.434],
  [0.4958, 0.4958],
  [0.5571, 0.5571],
  [0.6176, 0.6176],
  [0.6769, 0.6769],
  [0.7346, 0.7346],
  [0.7903, 0.7903],
  [0.8435, 0.8435],
  [0.8936, 0.8936],
  [0.9394, 0.9394],
  [0.9761, 0.9761],
  [1.0, 1.0],
];

// Normalized Robinson projection (x, y range roughly -1 to +1)
export function getRobinsonCoordinates2(lat: number, lon: number) {
  const absLat = Math.abs(lat);
  const lonRad = (lon * Math.PI) / 180;

  // Clamp to max 90° and find latitude band index
  const i = Math.min(Math.floor(absLat / 5), 17);
  const t = (absLat - i * 5) / 5;

  const [A0, B0] = ROBINSON_TABLE[i];
  const [A1, B1] = ROBINSON_TABLE[i + 1];
  const A = A0 + (A1 - A0) * t;
  const B = B0 + (B1 - B0) * t;

  // Robinson constants
  const X_SCALE = 0.8487;
  const Y_SCALE = 1.3523;

  const x = (X_SCALE * A * lonRad) / Math.PI; // normalize to [-1, 1]
  const y = Y_SCALE * (lat >= 0 ? B : -B);

  return { x, y };
}

// Official Robinson table from Snyder (1987), for every 5° of latitude.
// Each row: [latitude_deg, x_coeff (A), y_coeff (B)]
const ROBINSON = [
  [0, 1.0, 0.0],
  [5, 0.9986, 0.062],
  [10, 0.9954, 0.124],
  [15, 0.99, 0.186],
  [20, 0.9822, 0.248],
  [25, 0.973, 0.31],
  [30, 0.96, 0.372],
  [35, 0.9427, 0.434],
  [40, 0.9216, 0.4958],
  [45, 0.8962, 0.5571],
  [50, 0.8679, 0.6176],
  [55, 0.835, 0.6769],
  [60, 0.7986, 0.7346],
  [65, 0.7597, 0.7903],
  [70, 0.7186, 0.8435],
  [75, 0.6732, 0.8936],
  [80, 0.6213, 0.9394],
  [85, 0.5722, 0.9761],
  [90, 0.5322, 1.0],
];

// Converts lat/lon to Robinson x/y (normalized to -1..1 and -1..1 roughly)
export function getRobinsonCoordinates(lat: number, lon: number) {
  const absLat = Math.abs(lat);
  const lonRad = (lon * Math.PI) / 180;

  // find nearest lower index in 5° steps
  const i = Math.min(Math.floor(absLat / 5), 17);
  const t = (absLat - ROBINSON[i][0]) / 5;

  // linear interpolation
  const A = ROBINSON[i][1] + (ROBINSON[i + 1][1] - ROBINSON[i][1]) * t;
  const B = ROBINSON[i][2] + (ROBINSON[i + 1][2] - ROBINSON[i][2]) * t;

  const x = (A * lonRad) / Math.PI; // scaled like x=1 at 180°
  const y = Math.sign(lat) * B; // scaled like y=1 at 90°

  return { x, y };
}
