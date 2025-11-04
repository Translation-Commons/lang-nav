/**
 * For some reason, the Intl.NumberFormat library doesn't long currencies with
 * compact long format (eg. 1 million $) so we have to force it.
 */
export function getCurrencyCompactLong(num: number): string {
  const numCompactLong = Intl.NumberFormat(undefined, {
    notation: 'compact',
    compactDisplay: 'long',
  }).format(num);
  const currencyFormat = Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(10);
  return currencyFormat.replace(/\p{Decimal_Number}+/u, numCompactLong);
}

export function numberToSigFigs(num: number, sigFigs: number): number {
  if (num === 0) return 0;
  const factor = Math.pow(10, sigFigs - Math.ceil(Math.log10(Math.abs(num))));
  return Math.round(num * factor) / factor;
}

/**
 * When showing numbers there may be both very small and large numbers in the same context.
 * While generally we'd want them to be compared with the same number of decimals (eg. 13.1% and 6.8%),
 * when there are very small numbers (eg. 0.0023%) that will easily be rounded to oblivion (0.00%), so
 * this function will still show small numbers.
 */
export function numberToFixedUnlessSmall(value: number, precision: number = 2): string {
  if (Math.abs(value) > 10) {
    return value.toFixed(precision - 1);
  } else if (Math.abs(value) > 1) {
    return value.toFixed(precision);
  }
  return value.toPrecision(precision);
}
