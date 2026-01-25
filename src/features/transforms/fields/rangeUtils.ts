import { LanguageModality } from '@entities/language/LanguageModality';
import { VitalityEthnologueCoarse } from '@entities/language/vitality/VitalityTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { convertAlphaToNumber } from '@shared/lib/stringUtils';

import { ColorBy } from '../coloring/ColorTypes';
import { ScaleBy } from '../scales/ScaleTypes';
import { SortBy } from '../sorting/SortTypes';

import { getSortField } from './getField';

export function getMinimumValue(field?: ColorBy | ScaleBy): number {
  switch (field) {
    case SortBy.Longitude:
      return -180;
    case SortBy.Latitude:
      return -90;
    case SortBy.Modality:
      return LanguageModality.Written;
    case SortBy.ISOStatus:
      return -1;
    case SortBy.Population:
    case SortBy.PopulationDirectlySourced:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
    case SortBy.VitalityMetascore:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
    case SortBy.CountOfLanguages:
    case SortBy.CountOfWritingSystems:
    case SortBy.CountOfCountries:
    case SortBy.CountOfChildTerritories:
    case SortBy.CountOfCensuses:
    case SortBy.Area:
      return 0;
    case 'None':
      return 0;
    case SortBy.Date:
      return new Date(0).getTime();
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      return convertAlphaToNumber(''); // 0
    default:
      return 0;
  }
}

export function getMaximumValue(objects: ObjectData[], field?: ColorBy | ScaleBy): number {
  switch (field) {
    case 'None':
      return 0;
    case SortBy.Modality:
      return LanguageModality.Spoken;
    case SortBy.VitalityMetascore:
    case SortBy.ISOStatus:
    case SortBy.VitalityEthnologue2013:
    case SortBy.VitalityEthnologue2025:
      return VitalityEthnologueCoarse.Institutional; // 9;
    case SortBy.Latitude:
      return 90;
    case SortBy.PercentOfOverallLanguageSpeakers:
    case SortBy.PercentOfTerritoryPopulation:
    case SortBy.Literacy:
      return 100;
    case SortBy.Longitude:
      return 180;
    case SortBy.Date:
      return new Date().getTime(); // Today
    case SortBy.CountOfLanguages:
    case SortBy.CountOfWritingSystems:
    case SortBy.CountOfCountries:
    case SortBy.CountOfChildTerritories:
    case SortBy.CountOfCensuses:
    case SortBy.Population:
    case SortBy.PopulationDirectlySourced:
    case SortBy.PopulationOfDescendants:
    case SortBy.PopulationPercentInBiggestDescendantLanguage:
    case SortBy.Area:
      return Math.max(
        objects.reduce((acc, obj) => Math.max(acc, (getSortField(obj, field) as number) || 0), 0),
      );
    case SortBy.Name:
    case SortBy.Endonym:
    case SortBy.Code:
    case SortBy.Language:
    case SortBy.WritingSystem:
    case SortBy.Territory:
      return convertAlphaToNumber('ZZZZZZZZZZ');
    default:
      return 1;
  }
}
