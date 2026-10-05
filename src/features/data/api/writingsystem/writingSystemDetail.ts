import { useCallback } from 'react';

import { defineEndpoint } from '@features/data/api/core/defineEndpoint';
import { EntityRef } from '@features/data/api/list/tableContract';
import { useDataContext } from '@features/data/context/useDataContext';
import { PageParams } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import { getSortFunctionParameterized } from '@features/transforms/sorting/sort';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { EntityData } from '@entities/types/EntityTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

/** The Writing System details body: the contract for GET writing-systems/{id}/. Lists come in display order. */
export type WritingSystemDetail = {
  id: string;
  scope?: string;
  rightToLeft?: boolean;
  sample?: string;
  unicodeVersion?: number;
  populationUpperBound?: number;
  /** Set even when the code matches no language, which then shows as plain text. */
  primaryLanguageCode?: string;
  primaryLanguage?: EntityRef;
  languages: EntityRef[];
  territoryOfOrigin?: EntityRef;
  /** Locales where this writing system is explicit. */
  locales: EntityRef[];
  parent?: EntityRef;
  children: EntityRef[];
  contains: EntityRef[];
  keyboards: EntityRef[];
};

export type WritingSystemDetailQuery = Record<string, string>;

/** The params GET writing-systems/{id}/ must honor: names depend on the source, list order on the sort. */
export function toWritingSystemDetailQuery(
  id: string,
  params: PageParams,
): WritingSystemDetailQuery {
  const query: WritingSystemDetailQuery = {
    id,
    languageSource: params.languageSource,
    sortBy: params.sortBy,
    sortBehavior: String(params.sortBehavior),
  };
  if (params.secondarySortBy !== Field.None) {
    query.secondarySortBy = params.secondarySortBy;
    query.secondarySortBehavior = String(params.secondarySortBehavior);
  }
  return query;
}

const ref = (ent: EntityData): EntityRef => ({ id: ent.ID, name: ent.nameDisplay });

export function toWritingSystemDetail(
  ws: WritingSystemData,
  query: WritingSystemDetailQuery,
): WritingSystemDetail {
  const compare = getSortFunctionParameterized(
    query.sortBy as Field,
    Number(query.sortBehavior) as SortBehavior,
    query.secondarySortBy as Field | undefined,
    Number(query.secondarySortBehavior ?? SortBehavior.Normal) as SortBehavior,
  );
  const sorted = (ents: EntityData[] | undefined) => (ents ?? []).slice().sort(compare).map(ref);
  return {
    id: ws.ID,
    scope: ws.scope,
    rightToLeft: ws.rightToLeft,
    sample: ws.sample,
    unicodeVersion: ws.unicodeVersion,
    populationUpperBound: ws.populationUpperBound,
    primaryLanguageCode: ws.primaryLanguageCode,
    primaryLanguage: ws.primaryLanguage && ref(ws.primaryLanguage),
    languages: sorted(Object.values(ws.languages ?? {})),
    territoryOfOrigin: ws.territoryOfOrigin && ref(ws.territoryOfOrigin),
    locales: sorted(ws.localesWhereExplicit),
    parent: ws.parentWritingSystem && ref(ws.parentWritingSystem),
    children: sorted(ws.childWritingSystems),
    contains: sorted(ws.containsWritingSystems),
    keyboards: (ws.outputKeyboards ?? []).map(ref),
  };
}

function useWritingSystemDetailFromFiles() {
  const { getWritingSystem } = useDataContext();
  return useCallback(
    (query: WritingSystemDetailQuery) => {
      const ws = getWritingSystem(query.id);
      if (!ws) throw new Error(`Unknown writing system ${query.id}`);
      return toWritingSystemDetail(ws, query);
    },
    [getWritingSystem],
  );
}

export const useWritingSystemDetail = defineEndpoint(
  'writingSystemDetail',
  'writing-systems/{id}/',
  useWritingSystemDetailFromFiles,
);
