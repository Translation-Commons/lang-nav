import { defineEndpoint } from '@features/data/api/core/defineEndpoint';
import {
  BaseRow,
  EntityRef,
  TablePage,
  toBasePageQuery,
} from '@features/data/api/list/tableContract';
import { useTablePageFromFiles } from '@features/data/api/list/useTablePageFromFiles';
import { useDataContext } from '@features/data/context/useDataContext';
import { PageParams } from '@features/params/PageParamTypes';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { getCountriesInEntity } from '@entities/lib/getEntityRelatedTerritories';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

/** One row of the Writing Systems table: the contract for GET writing-systems/. */
export type WritingSystemRow = BaseRow & {
  populationUpperBound?: number;
  /** Largest first. Undefined when unknown, which renders as an empty cell. */
  languages?: EntityRef[];
  keyboardNames?: string[];
  territoryOfOrigin?: EntityRef;
  countryNames?: string[];
};

export type WritingSystemList = TablePage<WritingSystemRow>;

export function toWritingSystemRow(ws: WritingSystemData): WritingSystemRow {
  return {
    id: ws.ID,
    code: ws.codeDisplay,
    name: ws.nameDisplay,
    endonym: ws.nameEndonym,
    populationUpperBound: ws.populationUpperBound,
    languages:
      ws.languages &&
      Object.values(ws.languages)
        .sort(sortByPopulation)
        .map((l) => ({ id: l.ID, name: l.nameDisplay })),
    keyboardNames: ws.outputKeyboards?.map((kb) => kb.nameDisplay),
    territoryOfOrigin: ws.territoryOfOrigin && {
      id: ws.territoryOfOrigin.ID,
      name: ws.territoryOfOrigin.nameDisplay,
    },
    countryNames: getCountriesInEntity(ws)?.map((t) => t.nameDisplay),
  };
}

/** The page params GET writing-systems/ must honor. */
export function toWritingSystemListQuery(params: PageParams): Record<string, string> {
  return toBasePageQuery(params);
}

function useWritingSystemListFromFiles() {
  return useTablePageFromFiles(useDataContext().writingSystems, toWritingSystemRow);
}

export const useWritingSystemList = defineEndpoint(
  'writingSystemList',
  'writing-systems/',
  useWritingSystemListFromFiles,
);
