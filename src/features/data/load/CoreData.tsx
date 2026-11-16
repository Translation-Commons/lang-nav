import { useMemo, useState } from 'react';

import type { CensusData, CensusID } from '@entities/census/CensusTypes';
import type { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';
import { EntityData } from '@entities/types/EntityTypes';

import { type CoreData, getCoreDataArrays, loadCoreDataArrays } from './loadCoreDataArrays';

export type { CoreData, CoreDataArrays } from './loadCoreDataArrays';

export const EMPTY_LANGUAGES_BY_SCHEMA: LanguagesBySource = {
  Combined: {},
  ISO: {},
  BCP: {},
  Glottolog: {},
  UNESCO: {},
  CLDR: {},
};

/**
 * Get core data needed to show the tables -- things like language codes, relationships with other languages.
 */

export function useCoreData(): {
  loadCoreData: () => Promise<void>;
  coreData: CoreData;
} {
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [ents, setEnts] = useState<Record<string, EntityData>>({});

  // Censuses are not populated here, but this seems necessary because the state affects the page.
  const [censuses, setCensuses] = useState<Record<CensusID, CensusData>>({});

  async function loadCoreData(): Promise<void> {
    const loaded = await loadCoreDataArrays();
    if (loaded == null) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    setCensuses({}); // Censuses are not loaded here, but this is needed to enable the page updates.
    setLanguages(loaded.languages);
    setEnts(loaded.ents);
  }

  const coreData = useMemo(
    () => getCoreDataArrays(languages, ents, censuses),
    [languages, ents, censuses],
  );

  return {
    loadCoreData,
    coreData,
  };
}
