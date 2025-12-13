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
    SortBy.CountOfDialects,
    SortBy.CountOfTerritories,
  ];

  let filteredScaleBys = [...allowedScaleBys];

  // Exclude area and count-of-languages when mapping Languages (use CountOfDialects instead)
  if (objectType === ObjectType.Language) {
    filteredScaleBys = filteredScaleBys.filter(
      (s) => s !== SortBy.CountOfLanguages && s !== SortBy.Area,
    );
  }

  // Exclude count-of-dialects when mapping Territories (use CountOfLanguages instead)
  if (objectType === ObjectType.Territory) {
    filteredScaleBys = filteredScaleBys.filter((s) => s !== SortBy.CountOfDialects);
  }

  return filteredScaleBys;
}
