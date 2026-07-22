export const PROTOTYPICAL_NUMS = [0, 1, 2, 3, 5, 10, 11, 20, 1000000, '1c6'];

// Most of these sets have 10 items each to fit in a grid
export const SMALL_NUMS = ['0.0', 0.1, 0.2, 0.3, 0.5, 0.7, '1.0', 1.5, '2.0', 2.5];
export const ZERO_TO_NINE_NUMS = Array.from({ length: 10 }, (_, i) => i);
export const TEENS_NUMS = Array.from({ length: 10 }, (_, i) => i + 10);
export const TWENTY_TO_NINETY_NUMS = Array.from({ length: 8 }, (_, i) => (i + 2) * 10);
export const ZERO_TO_99_NUMS = Array.from({ length: 100 }, (_, i) => i);
export const LARGE_NUMS = [
  100, 1000, 10000, 100000, 1000000, 1000001, 1000002, 1000010, 10000000, 100000000,
];

export const SCIENTIFIC_NUMS = [
  '1e2',
  '1e3',
  '1e4',
  '1e5',
  '1e6',
  '1.000001e6',
  '1.000002e6',
  '1.00001e6',
  '1e7',
  '1e8',
];

// Similar to scientific notation, this represents values in a mixed word-number compact form like "1 million"
export const COMPACT_NUMS = [
  '1c2',
  '1c3',
  '1c4',
  '1c5',
  '1c6',
  '1.000001c6',
  '1.000002c6',
  '1.00001c6',
  '1c7',
  '1c8',
];
export const COMPACT_NUM_LABELS = [
  '1 hundred',
  '1 thousand',
  '10 thousand',
  '100 thousand',
  '1 million',
  '1 million (+1)',
  '1 million (+2)',
  '1 million (+10)',
  '10 million',
  '100 million',
];
