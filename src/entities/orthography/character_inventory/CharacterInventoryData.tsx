import { useCallback, useMemo } from 'react';

import usePagination from '@features/pagination/usePagination';
import usePageParams from '@features/params/usePageParams';
import { parseFilterEntityID } from '@features/transforms/filtering/FilterEntityID';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';
import { useSortFunction } from '@features/transforms/sorting/sort';

import { useCharacterInventoryParams } from '@entities/orthography/character_inventory/CharacterInventoryContext';
import {
  CharVisibility,
  SortCharsBy,
  SortEntriesBy,
} from '@entities/orthography/character_inventory/CharacterInventoryTypes';
import { EntityData, EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

const useCharacterInventoryData: () => {
  sortedCounts: [string, number][];
  getCharColVisibility: (char: string, count: number) => boolean;
  currentCharsByEnt: Record<string, Set<string>>;
  entsWithCharData: EntityData[];
} = () => {
  const { writingSystemFilter } = usePageParams();
  const ents = useFilteredEntities({}).filteredEntities;
  const { getCurrentEntities } = usePagination<EntityData>();
  const pageSort = useSortFunction();
  const { sortCharsBy, charVisibility, sortEntriesBy } = useCharacterInventoryParams();

  const writingSystemFilterCode = parseFilterEntityID(
    writingSystemFilter,
    EntityType.WritingSystem,
  ).code;
  const sortCharsFunction = useCallback(
    (a: [string, number], b: [string, number]) => {
      switch (sortCharsBy) {
        case SortCharsBy.Count:
          return b[1] - a[1];
        case SortCharsBy.Codepoint:
          return a[0].codePointAt(0)! - b[0].codePointAt(0)!;
        case SortCharsBy.Alphabetical:
          return a[0].localeCompare(b[0]);
        default:
          enforceExhaustiveSwitch(sortCharsBy);
      }
    },
    [sortCharsBy],
  );

  // Saves this to avoid recomputing character sets for each entity multiple times
  const currentCharsByEnt = useMemo(() => {
    const charsByEnt: Record<string, Set<string>> = {};
    if (!writingSystemFilterCode) return {};
    ents.forEach((ent) => {
      const chars = getEntityCharacters(ent, writingSystemFilterCode);
      if (chars) charsByEnt[ent.ID] = new Set(chars);
    });
    return charsByEnt;
  }, [ents, writingSystemFilterCode]);

  const sortEntries = useCallback(
    (a: EntityData, b: EntityData) => {
      switch (sortEntriesBy) {
        case SortEntriesBy.PageSort:
          return pageSort(a, b);
        case SortEntriesBy.CharacterCount:
          return (currentCharsByEnt[b.ID]?.size ?? 0) - (currentCharsByEnt[a.ID]?.size ?? 0);
        case SortEntriesBy.CharacterCountInverse:
          return (currentCharsByEnt[a.ID]?.size ?? 0) - (currentCharsByEnt[b.ID]?.size ?? 0);
        default:
          enforceExhaustiveSwitch(sortEntriesBy);
      }
    },
    [pageSort, sortEntriesBy, currentCharsByEnt],
  );
  const entsWithCharData = useMemo(() => {
    return ents
      .filter((ent) => currentCharsByEnt[ent.ID] && currentCharsByEnt[ent.ID].size > 0)
      .sort(sortEntries);
  }, [ents, currentCharsByEnt, sortEntries]);

  const sortedCounts = useMemo(() => {
    return Object.entries(getCharacterCounts(entsWithCharData, currentCharsByEnt)).sort(
      sortCharsFunction,
    );
  }, [entsWithCharData, sortCharsFunction, currentCharsByEnt]);

  // Ways to approximate which characters are most significant in the current view
  const currentEntities = getCurrentEntities(entsWithCharData);
  const tenthHighestCount = useMemo(() => {
    const currentCounts = getCharacterCounts(entsWithCharData, currentCharsByEnt);
    return [...Object.entries(currentCounts)].sort((a, b) => b[1] - a[1])[9]?.[1] ?? 0;
  }, [entsWithCharData, currentCharsByEnt]);
  const currentConflicts = useMemo(() => {
    const ents =
      charVisibility === CharVisibility.ConflictsWithinVisible ? currentEntities : entsWithCharData;
    const conflicts = new Set<string>();
    Object.entries(getCharacterCounts(ents, currentCharsByEnt)).forEach(([char, count]) => {
      if (count !== ents.length && count !== 0) conflicts.add(char);
    });
    return conflicts;
  }, [entsWithCharData, currentCharsByEnt, currentEntities, charVisibility]);
  const currentCommon = useMemo(() => {
    const ents =
      charVisibility === CharVisibility.CommonWithinVisible ? currentEntities : entsWithCharData;
    const common = new Set<string>();
    Object.entries(getCharacterCounts(ents, currentCharsByEnt)).forEach(([char, count]) => {
      if (count === ents.length && count !== 0) common.add(char);
    });
    return common;
  }, [entsWithCharData, currentCharsByEnt, currentEntities, charVisibility]);

  const getCharColVisibility = useCallback(
    (char: string, count: number) => {
      switch (charVisibility) {
        case CharVisibility.TopCount:
          return count >= tenthHighestCount;
        case CharVisibility.ConflictsOverall:
        case CharVisibility.ConflictsWithinVisible:
          return currentConflicts.has(char);
        case CharVisibility.CommonOverall:
        case CharVisibility.CommonWithinVisible:
          return currentCommon.has(char);
        case CharVisibility.ShowAll:
          return true;
        default:
          enforceExhaustiveSwitch(charVisibility);
      }
    },
    [charVisibility, tenthHighestCount, currentConflicts, currentCommon],
  );

  return { sortedCounts, getCharColVisibility, currentCharsByEnt, entsWithCharData };
};

function getEntityCharacters(
  ent: EntityData,
  writingSystemFilterCode: string,
): Set<string> | undefined {
  if (ent.type === EntityType.Language) {
    return new Set(
      ent.orthographies
        ?.filter((o) => o.scriptCode === writingSystemFilterCode)
        .flatMap((o) => Array.from(o.baseCharacters ?? [])),
    );
  }
  if (ent.type === EntityType.Orthography) {
    if (ent.scriptCode !== writingSystemFilterCode) return undefined;
    return new Set(Array.from(ent.baseCharacters ?? []));
  }
  return undefined;
}

function getCharacterCounts(ents: EntityData[], charsByEnt: Record<string, Set<string>>) {
  return ents.reduce(
    (charCounts, ent) => {
      const chars = charsByEnt[ent.ID];
      if (!chars) return charCounts;
      Array.from(chars).forEach((char) => (charCounts[char] = (charCounts[char] ?? 0) + 1));
      return charCounts;
    },
    {} as Record<string, number>,
  );
}

export default useCharacterInventoryData;
