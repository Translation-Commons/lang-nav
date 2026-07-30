import getLanguageModalityDiscount from '@entities/language/population/getLanguageModalityDiscount';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { isTerritoryGroup } from '@entities/territory/TerritoryTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

export function computeLocalesWritingPopulation(locales: LocaleData[]): void {
  // Country & Dependencies have literacy values from the UN
  locales
    .filter(
      (l) => !isTerritoryGroup(l.territory?.scope), // Skip regional locales
    )
    .forEach((locale) => {
      const { speaking, writing } = locale.pop;
      locale.literacyPercent = locale.territory?.literacyPercent ?? 100;

      if (speaking.unadjusted == null) return;
      writing.unadjusted = speaking.unadjusted;
      writing.source = speaking.source;
      if (speaking.percent != null) writing.percent = speaking.percent;
      writing.literacyDiscount = locale.literacyPercent / 100;
      writing.modalityDiscount = getLanguageModalityDiscount(locale.language?.modality, 'writing');
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
