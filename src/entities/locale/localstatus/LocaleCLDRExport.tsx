import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';

export function prepareCLDRLocalePopulationForExport(objects: ObjectData[]) {
  const locales = objects.filter((obj) => obj.type === ObjectType.Locale);

  // CLDR repository' country_language_population.tsv
  // #CName	CCode	CPopulation	CLiteracy	CGdp	OfficialStatus	Language	LCode	LPopulation	WritingPop	References	Notes
  const exportString = locales
    .filter((locale) => (locale.populationSpeakingPercent || 0) > 0.01)
    .sort((a, b) => {
      // Sort by Language name
      const aPop = a.language?.nameDisplay ?? '';
      const bPop = b.language?.nameDisplay ?? '';
      return aPop.localeCompare(bPop);
    })
    .sort((a, b) => {
      // Then sort by country name
      const aPop = a.territory?.nameDisplay ?? '';
      const bPop = b.territory?.nameDisplay ?? '';
      return aPop.localeCompare(bPop);
    })
    .map((locale) => {
      return [
        locale.territory?.nameDisplay, // CName
        locale.territoryCode, // CCode
        '"' + locale.territory?.population?.toLocaleString() + '"', // CPopulation
        Math.round(locale.territory?.literacyPercent ?? 0) + '%', // CLiteracy
        '"' + locale.territory?.gdp?.toLocaleString() + '"', // CGdp
        locale.officialStatus, // OfficialStatus
        locale.language?.nameDisplay, // Language
        locale.languageCode, // LCode
        numberToSigFigs(locale.populationSpeakingPercent ?? 0, 4) + '%', // LPopulation
        '', // WritingPop, our estimates are not reliable yet
        '', // References, unused in CLDR
        locale.populationCensus?.url, // Notes
      ]
        .map((v) => (v != null ? v : ''))
        .join('\t');
    })
    .join('\n');

  return exportString;
}
