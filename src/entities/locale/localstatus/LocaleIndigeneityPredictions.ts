import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

/**
 * Right now both predictions very coarsely predict that a locale is indigenous if it
 * is in the country with the biggest population -- but some languages formed in larger groups and some
 * times the biggest country is where migrants went, not part of the original language area.
 *
 * Nonetheless this is a good starting point for most data and can be improved on as we gather more data and insights.
 */
export function getLocaleFormedHerePrediction(locale: LocaleData): boolean {
  return getLanguagesBiggestCountryLocale(locale.language)?.territory?.ID === locale.territory?.ID;
}

export function getHistoricPresencePrediction(locale: LocaleData): boolean {
  return getLanguagesBiggestCountryLocale(locale.language)?.territory?.ID === locale.territory?.ID;
}

export function getLanguagesBiggestCountryLocale(
  lang: LanguageData | undefined,
): LocaleData | undefined {
  if (!lang) return undefined;
  return lang.locales
    .filter((l) => l.territory != null && l.territory.scope === TerritoryScope.Country)
    .sort(sortByPopulation)[0];
}
