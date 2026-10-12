import { useRef } from 'react';

import type { LanguageScope } from '@entities/language/LanguageTypes';
import type { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import type { LanguageModality } from '@entities/language/writing/LanguageModality';
import type { TerritoryScope } from '@entities/territory/TerritoryTypes';

import type { PageParams } from './PageParamTypes';

type GetNextParamArrays = (
  instantiatedParams: Partial<PageParams>,
  defaults: PageParams,
) => {
  isoStatus: LanguageISOStatus[];
  modalityFilter: LanguageModality[];
  languageScopes: LanguageScope[];
  territoryScopes: TerritoryScope[];
};

export function useStableParamArrays(): GetNextParamArrays {
  const stableFilterArrays = useRef<
    | Pick<PageParams, 'isoStatus' | 'modalityFilter' | 'languageScopes' | 'territoryScopes'>
    | undefined
  >(undefined);

  function getNextParamArrays(instantiatedParams: Partial<PageParams>, defaults: PageParams) {
    const prev = stableFilterArrays.current;
    const next = {
      isoStatus: instantiatedParams.isoStatus ?? defaults.isoStatus,
      modalityFilter: instantiatedParams.modalityFilter ?? defaults.modalityFilter,
      languageScopes: instantiatedParams.languageScopes ?? defaults.languageScopes,
      territoryScopes: instantiatedParams.territoryScopes ?? defaults.territoryScopes,
    };
    const filterArrays = {
      isoStatus: retainIfEqual(next.isoStatus, prev?.isoStatus),
      modalityFilter: retainIfEqual(next.modalityFilter, prev?.modalityFilter),
      languageScopes: retainIfEqual(next.languageScopes, prev?.languageScopes),
      territoryScopes: retainIfEqual(next.territoryScopes, prev?.territoryScopes),
    };
    stableFilterArrays.current = filterArrays;
    return filterArrays;
  }

  return getNextParamArrays;
}

function retainIfEqual<T>(next: T[], previous: T[] | undefined): T[] {
  return previous &&
    next.length === previous.length &&
    next.every((value, index) => value === previous[index])
    ? previous
    : next;
}
