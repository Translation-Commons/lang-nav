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
      locale.literacyPercent = locale.territory?.literacyPercent ?? 100;

      if (locale.pop.speaking.unadjusted == null) return;
      locale.pop.writing.unadjusted = Math.round(
        (locale.pop.speaking.unadjusted * locale.literacyPercent) / 100,
      );
      if (locale.pop.speaking.percent != null) {
        locale.pop.writing.percent = (locale.pop.speaking.percent * locale.literacyPercent) / 100;
      }
    });

  // Compute regional literacy by adding up the writing populations of the contained locales
  locales
    .filter((l) => isTerritoryGroup(l.territory?.scope))
    .forEach((locale) => {
      locale.pop.writing.unadjusted = sumBy(
        uniqueBy(locale.relatedLocales?.childTerritories ?? [], (loc) => loc.territoryCode || ''),
        (locale) => locale.pop.writing.unadjusted ?? 0,
      );
      if (locale.pop.speaking.unadjusted && locale.pop.writing.unadjusted) {
        locale.literacyPercent = Math.round(
          (locale.pop.writing.unadjusted * 100) / locale.pop.speaking.unadjusted,
        );
      }
    });
}
