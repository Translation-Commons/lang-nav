import { ScriptCode, TerritoryCode } from './DataTypes';
import { LanguageCode } from './LanguageTypes';

export enum CLDRCoverageLevel {
  Core = 'core', // Language identification
  Basic = 'basic', // Essential date/time/number formats. Translations for native language/script/region.
  Moderate = 'moderate', // Most date/time/number formats. Timezone and currency information. Translations for common languages/scripts/regions.
  Modern = 'modern', // Translations for emoji characters, measurement units, final date/time formats and translations.
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
