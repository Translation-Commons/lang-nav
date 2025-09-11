import cldrLocalesData from '../../public/data/unicode/cldrLocales.json';
import type { CLDRLocaleIndex, CLDRLocaleSupport } from '../types/CLDRLocaleTypes';

// Import the generated JSON instead of requiring it.

// Cast to the correct interface
const rawData: CLDRLocaleIndex = cldrLocalesData as unknown as CLDRLocaleIndex;

/** Return all CLDR locale support entries. */
export function getAllCldrLocales(): CLDRLocaleSupport[] {
  return rawData.locales;
}

/** Retrieve the CLDR support entry for a given locale code. */
export function getCldrLocale(localeId: string): CLDRLocaleSupport | undefined {
  const idLower = localeId.toLowerCase();
  return rawData.locales.find((entry) => entry.locale.toLowerCase() === idLower);
}
