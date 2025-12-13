import { ObjectType } from '@features/params/PageParamTypes';

import { SortBy } from '../sorting/SortTypes';

// ScaleBy can be any SortBy value or 'None'
export type ScaleBy = SortBy | 'None';

/**
 * Get the scale-by options applicable to a given object type.
 * Returns a filtered list of allowed scale-by fields based on the object type.
 */
export function getScaleBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  // Base allowed scale-by fields (all support scaling)
  const allowedScaleBys: SortBy[] = [
    SortBy.Population,
    SortBy.PopulationAttested,
    SortBy.Area,
    SortBy.CountOfLanguages,
    SortBy.CountOfTerritories,
  ];

  let filteredScaleBys = [...allowedScaleBys];

  // Exclude count-of-languages and area when mapping Languages
  if (objectType === ObjectType.Language) {
    filteredScaleBys = filteredScaleBys.filter(
      (s) => s !== SortBy.CountOfLanguages && s !== SortBy.Area,
    );
  }

  // Exclude count-of-territories when mapping Territories
  if (objectType === ObjectType.Territory) {
    filteredScaleBys = filteredScaleBys.filter((s) => s !== SortBy.CountOfTerritories);
  }

  return filteredScaleBys;
}
