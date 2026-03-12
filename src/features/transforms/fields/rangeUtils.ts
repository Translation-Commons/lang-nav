import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope } from '@entities/language/LanguageTypes';
import { VitalityEthnologueCoarse } from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { maxBy } from '@shared/lib/setUtils';
import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import Field from './Field';
import getField from './getField';

export function getMinimumValue(field?: Field): number {
  if (field == null) return 0; // default min for when no field is selected
  switch (field) {
    case Field.Longitude:
      return -180;
    case Field.Latitude:
      return -90;
    case Field.Modality:
      return LanguageModality.Written;
    case Field.ISOStatus:
    case Field.LanguageFormedHere:
    case Field.HistoricPresence:
      return -1; // -1 is undefined
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
    case Field.Literacy:
    case Field.VitalityMetascore:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.CountOfVariantTags:
    case Field.Area:
    case Field.Depth:
    case Field.None:
      return 0;
    case Field.UnicodeVersion:
      return 1.1;
    case Field.LanguageScope:
      return LanguageScope.SpecialCode;
    case Field.TerritoryScope:
      return TerritoryScope.Dependency;
    case Field.Date:
      return new Date(0).getTime();
    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.Territory:
    case Field.Region:
    case Field.Platform:
    case Field.OutputScript:
    case Field.VariantTag:
    case Field.Source:
    case Field.Description:
    case Field.Example:
      return convertAlphaToNumber(''); // 0

    // Not yet defined on a continuous scale
    case Field.WritingSystemScope:
    case Field.Indigeneity:
    case Field.DigitalSupport:
    case Field.GovernmentStatus:
    case Field.SourceType:
    case Field.CLDRCoverage:
    case Field.Coordinates:
      return 0;
    default:
      enforceExhaustiveSwitch(field);
  }
}

export function getMaximumValue(objects: ObjectData[], field?: Field): number {
  if (field == null) return 1; // default max for when no field is selected
  switch (field) {
    case Field.None:
    case Field.LanguageFormedHere:
    case Field.HistoricPresence:
      return 1;
    case Field.Modality:
      return LanguageModality.Spoken;
    case Field.VitalityMetascore:
    case Field.ISOStatus:
    case Field.VitalityEthnologueFine:
    case Field.VitalityEthnologueCoarse:
      return VitalityEthnologueCoarse.Institutional; // 9;
    case Field.LanguageScope:
      return LanguageScope.Family; // Larger value = broader scope
    case Field.Latitude:
      return 90;
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PercentOfTerritoryPopulation:
    case Field.Literacy:
      return 100;
    case Field.Longitude:
      return 180;
    case Field.Date:
      return new Date().getTime(); // Today
    case Field.TerritoryScope:
      // return Not doing "World" as max since its not always shown and can throw off the color scaling
      return maxBy(objects, (obj) => (getField(obj, field) as number) || 0) || 0;
    case Field.CountOfLanguages:
    case Field.CountOfWritingSystems:
    case Field.CountOfCountries:
    case Field.CountOfChildTerritories:
    case Field.CountOfCensuses:
    case Field.CountOfVariantTags:
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationOfDescendants:
    case Field.PopulationPercentInBiggestDescendantLanguage:
    case Field.Area:
    case Field.Depth:
    case Field.UnicodeVersion:
      return maxBy(objects, (obj) => (getField(obj, field) as number) || 0) || 0;
    case Field.Name:
    case Field.Endonym:
    case Field.Code:
    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.Territory:
    case Field.Region:
    case Field.Platform:
    case Field.OutputScript:
    case Field.VariantTag:
    case Field.Source:
    case Field.Description:
    case Field.Example:
      return convertAlphaToNumber('ZZZZZZZZZZ');

    // Not yet defined on a continuous scale
    case Field.WritingSystemScope:
    case Field.Indigeneity:
    case Field.DigitalSupport:
    case Field.GovernmentStatus:
    case Field.SourceType:
    case Field.CLDRCoverage:
    case Field.Coordinates:
      return 0;
    default:
      enforceExhaustiveSwitch(field);
  }
}
