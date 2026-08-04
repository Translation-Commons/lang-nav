import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';
import { isTerritoryGroup, TerritoryData } from '@entities/territory/TerritoryTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

/**
 * Computes the population for regional locales by aggregating populations from their contained locales.
 * This function should be called starting from the world territory (ID '001') and will recursively
 * compute populations for all contained territories and their locales.
 */
export function computeRegionalLocalesPopulation(territory: TerritoryData | undefined): void {
  // Only recompute for regional locales
  if (territory == null || !isTerritoryGroup(territory.scope)) return;

  // Re-compute the estimate for the contained territories first.
  territory.containsTerritories?.forEach(computeRegionalLocalesPopulation);

  // Now go through the locales and re-compute their population
  territory.locales?.forEach((locale) => {
    sumUpPopulationFromContainedTerritories(locale, 'speaking');
    sumUpPopulationFromContainedTerritories(locale, 'writing');
    locale.literacyPercent =
      locale.pop.speaking.adjusted && locale.pop.writing.adjusted
        ? Math.min((locale.pop.writing.adjusted * 100) / locale.pop.speaking.adjusted, 100)
        : undefined;
  });
}

export function sumUpPopulationFromContainedTerritories(
  locale: LocaleData,
  use: 'speaking' | 'writing',
): void {
  // Only recompute for regional locales that don't have a census record and for which we have related locales
  const { territory, relatedLocales } = locale;
  const pop = locale.pop[use];
  if (!relatedLocales || !territory || pop.census) return;

  // For these locales, sometimes there are multiple contained locales with the same territory code like zh_Hans_SG and zh_Hant_SG
  // so get only unique locales
  const uniqueContainedLocales = uniqueBy(
    [...(relatedLocales.childTerritories ?? [])].sort(
      (a, b) => (b.pop[use].adjusted ?? 0) - (a.pop[use].adjusted ?? 0),
    ),
    (loc) => loc.territoryCode || '',
  ).filter((loc) => loc.territoryCode !== '');

  // Add up the adjusted population of unique contained locales (eg don't double count
  // zh_Hans_SG and zh_Hant_SG). The adjusted population is corrected to the current year
  // to smooth out population growth between data collected in different years.
  pop.source = PopulationSourceCategory.AggregatedFromTerritories;
  pop.adjusted = sumBy(uniqueContainedLocales, (loc) => loc.pop[use].adjusted) || undefined;
  relatedLocales.sumOfPopulationFromChildTerritories = pop.adjusted;
  // Set population to be the sum of the unadjusted population
  pop.unadjusted =
    sumBy(uniqueContainedLocales, (loc) => loc.pop[use].unadjusted || 0) || undefined;

  // Compute the percent based on the adjusted population for regional locales.
  if (pop.unadjusted != null) pop.percent = (pop.unadjusted / (territory.pop.overall || 1)) * 100;
  if (pop.adjusted != null)
    pop.percentAdjusted = (pop.adjusted / (territory.pop.overall || 1)) * 100;
}

export function computeLanguageFamilyLocalePopulations(locales: LocaleData[]): void {
  // For all root locales
  locales
    .filter((loc) => !loc.relatedLocales?.parentLanguage)
    .forEach(getLanguageFamilyLocalePopulation);
}

function getLanguageFamilyLocalePopulation(locale: LocaleData): void {
  // Re-compute the estimate for the child languages first.
  const childLanguages = locale.relatedLocales?.childLanguages;
  if (!childLanguages) return;
  childLanguages.forEach((locale) => getLanguageFamilyLocalePopulation(locale));

  // Then add it up for this locale
  sumUpPopulationFromChildLanguages(locale, 'speaking');
  sumUpPopulationFromChildLanguages(locale, 'writing');
  locale.literacyPercent =
    locale.pop.speaking.adjusted && locale.pop.writing.adjusted
      ? Math.min((locale.pop.writing.adjusted * 100) / locale.pop.speaking.adjusted, 100)
      : undefined;
}

function sumUpPopulationFromChildLanguages(locale: LocaleData, use: 'speaking' | 'writing'): void {
  // Only recompute for locales that don't have a census record and for which we have related locales
  const { territory, relatedLocales } = locale;
  const pop = locale.pop[use];
  if (!relatedLocales || !territory || pop.census) return;

  // Add up the adjusted population of unique child locales (eg don't double count
  // zh_Hans_SG and zh_Hant_SG). The adjusted population is corrected to the current year
  // to smooth out population growth between data collected in different years.
  const uniqueChildLocales = uniqueBy(
    [...(relatedLocales.childLanguages ?? [])].sort(
      (a, b) => (b.pop[use].adjusted ?? 0) - (a.pop[use].adjusted ?? 0),
    ),
    (loc) => loc.languageCode || '',
  ).filter((loc) => loc.languageCode !== '');
  let newPopulationEstimate =
    sumBy(uniqueChildLocales, (loc) => loc.pop[use].adjusted) || undefined;
  if (!newPopulationEstimate) return; // do nothing if its 0 or undefined

  // Limit the new estimate if it is greater than the population
  const maxPopulation = territory.pop[use] || territory.pop.overall;
  if (newPopulationEstimate > maxPopulation) newPopulationEstimate = maxPopulation;
  relatedLocales.sumOfPopulationFromChildLanguages = newPopulationEstimate;

  // Don't use it if there already is a population estimate that is close
  // For instance, a macrolanguage may already have data from a census
  if (pop.adjusted && newPopulationEstimate <= pop.adjusted) return;

  // Otherwise great! We got a new value
  pop.adjusted = newPopulationEstimate;
  pop.source = PopulationSourceCategory.AggregatedFromLanguages;

  // Set population to be the sum of the unadjusted population
  pop.unadjusted = sumBy(uniqueChildLocales, (loc) => loc.pop[use].unadjusted || 0) || undefined;
  if (pop.unadjusted && pop.unadjusted > maxPopulation) pop.unadjusted = maxPopulation;

  // Compute the percent based on the adjusted population for regional locales.
  if (pop.unadjusted != null) pop.percent = (pop.unadjusted / (territory.pop.overall || 1)) * 100;
  if (pop.adjusted != null)
    pop.percentAdjusted = (pop.adjusted / (territory.pop.overall || 1)) * 100;
}
