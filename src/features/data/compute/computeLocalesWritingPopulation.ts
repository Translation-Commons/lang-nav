import { isTerritoryGroup, LocaleData } from '@entities/types/DataTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

export function computeLocalesWritingPopulation(locales: LocaleData[]): void {
  // Country & Dependencies have literacy values from the UN
  locales
    .filter(
      (l) => !isTerritoryGroup(l.territory?.scope), // Skip regional locales
    )
    .forEach((locale) => {
      locale.literacyPercent = locale.territory?.literacyPercent ?? 100;

      if (locale.populationSpeaking == null) return;
      locale.populationWriting = Math.round(
        (locale.populationSpeaking * locale.literacyPercent) / 100,
      );
      if (locale.populationSpeakingPercent != null) {
        locale.populationWritingPercent =
          (locale.populationSpeakingPercent * locale.literacyPercent) / 100;
      }
    });

  // Compute regional literacy by adding up the writing populations of the contained locales
  locales
    .filter((l) => isTerritoryGroup(l.territory?.scope))
    .forEach((locale) => {
      locale.populationWriting = sumBy(
        uniqueBy(locale.relatedLocales?.childTerritories ?? [], (loc) => loc.territoryCode || ''),
        (locale) => locale.populationWriting ?? 0,
      );
      if (locale.populationSpeaking && locale.populationWriting) {
        locale.literacyPercent = Math.round(
          (locale.populationWriting * 100) / locale.populationSpeaking,
        );
      }
    });
}
