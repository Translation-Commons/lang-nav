import { TerritoryCode } from '@entities/territory/TerritoryTypes';
import { ScriptCode } from '@entities/writingsystem/WritingSystemTypes';

import { LanguageCode } from '../language/LanguageTypes';

export enum CLDRCoverageLevel {
  Unknown = 0,
  Core = 1, // Language identification
  Basic = 2, // Essential date/time/number formats. Translations for native language/script/region.
  Moderate = 3, // Most date/time/number formats. Timezone and currency information. Translations for common languages/scripts/regions.
  Modern = 4, // Translations for emoji characters, measurement units, final date/time formats and translations.
}

export type CLDRCoverageImport = {
  languageCode: LanguageCode;
  explicitScriptCode?: ScriptCode;
  nameDisplay: string;
  nameEndonym: string;
  scriptDefaultCode: ScriptCode;
  territoryDefaultCode: TerritoryCode;
  countOfCLDRLocales: number;
  targetCoverageLevel: CLDRCoverageLevel;
  actualCoverageLevel: CLDRCoverageLevel;
  inICU: boolean;
  percentOfValuesConfirmed: number;
  percentOfModernValuesComplete: number;
  percentOfModerateValuesComplete: number;
  percentOfBasicValuesComplete: number;
  percentOfCoreValuesComplete: number;
  missingFeatures: string[];
};

export type CLDRCoverageData = {
  countOfCLDRLocales: number;
  targetCoverageLevel: CLDRCoverageLevel;
  actualCoverageLevel: CLDRCoverageLevel;
  inICU: boolean;
};

export type CLDRLanguageMatchData = {
  desired: string;
  supported: string;
  distance: number;
  oneway?: boolean;
};
