import getLanguageModalityDiscount from '@entities/language/population/getLanguageModalityDiscount';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { isTerritoryGroup } from '@entities/territory/TerritoryTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

/**
 * While we prefer to compute the writing population from censuses, this handles cases where we
 * do not have census data
 * It may be just a legacy of old code.
 *
 * Note this happens after computeLocalesPopulationFromCensuses
 */
export function computeLocalesWritingPopulation(locales: LocaleData[]): void {
  // Country & Dependencies have literacy values from the UN
  locales
    .filter(
      (l) => !isTerritoryGroup(l.territory?.scope), // Skip regional locales
    )
    .forEach((locale) => {
      const { speaking, writing } = locale.pop;
      locale.literacyPercent = locale.territory?.literacyPercent ?? 100;

      // Can skip the locale if we already have writing data OR if we don't have speaking data to go from
      if (writing.adjusted != null || speaking.unadjusted == null) return;

      // Setup the inputs to compute the writing population based on the speaking population, literacy rate, and nature of the language
      writing.unadjusted = speaking.unadjusted;
      writing.source = speaking.source;
      writing.literacyDiscount = locale.literacyPercent / 100;
      writing.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, 'writing');

      // Compute the percent and adjusted values
      if (speaking.percent != null) writing.percent = speaking.percent;
      else writing.percent = (writing.unadjusted / (locale.territory?.population || 1)) * 100;
      writing.percentAdjusted =
        writing.percent * (writing.literacyDiscount ?? 1) * (writing.modalityDiscount ?? 1);
      writing.adjusted = (writing.percentAdjusted / 100.0) * (locale.territory?.population || 1);
    });

  // Compute regional literacy by adding up the writing populations of the contained locales
  locales
    .filter((l) => isTerritoryGroup(l.territory?.scope))
    .forEach((locale) => {
      const { speaking, writing } = locale.pop;
      writing.unadjusted = sumBy(
        uniqueBy(locale.relatedLocales?.childTerritories ?? [], (loc) => loc.territoryCode || ''),
        (locale) => locale.pop.writing.unadjusted ?? 0,
      );
      if (speaking.unadjusted && writing.unadjusted) {
        locale.literacyPercent = Math.round((writing.unadjusted * 100) / speaking.unadjusted);
      }
    });
}
