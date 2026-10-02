import React, { useCallback, useEffect, useMemo, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import type { LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData, EntityType } from '@entities/types/EntityTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { updateEntitiesBasedOnDataParams } from '../compute/updateEntitiesBasedOnDataParams';
import { useCoreData } from '../load/CoreData';
import { loadSupplementalData } from '../load/SupplementalData';

import LoadingStage from './LoadingStage';
import { DataContext, DataContextType } from './useDataContext';

// Create a provider component
const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { languageSource, localeSeparator } = usePageParams();
  const { coreData, loadCoreData } = useCoreData();
  const [loadProgress, setLoadProgress] = useState<LoadingStage>(LoadingStage.Initial);
  const [dataRevision, setDataRevision] = useState<number>(0);

  useEffect(() => {
    const loadPrimaryData = async () => {
      await loadCoreData();
      setLoadProgress(LoadingStage.HasCoreData);
    };
    loadPrimaryData();
  }, []); // this is called once after page load

  const getEntity = useCallback(
    (id: string): EntityData | undefined => coreData.ents[id],
    [coreData],
  );
  const getLanguage = useCallback(
    (id: string): LanguageData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Language ? ent : undefined;
    },
    [coreData],
  );
  const getCLDRLanguage = useCallback(
    (id: string): LanguageData | undefined => {
      const lang = getLanguage(id);
      const aliasedTo = lang?.CLDR.dataProvider;
      if (aliasedTo?.type === EntityType.Language) return aliasedTo;
      return lang;
    },
    [coreData],
  );
  const getLocale = useCallback(
    (id: string): LocaleData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Locale ? ent : undefined;
    },
    [coreData],
  );
  const getTerritory = useCallback(
    (id: string): TerritoryData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Territory ? ent : undefined;
    },
    [coreData],
  );
  const getWritingSystem = useCallback(
    (id: string): WritingSystemData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.WritingSystem ? ent : undefined;
    },
    [coreData],
  );
  const getVariant = useCallback(
    (id: string): VariantData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Variant ? ent : undefined;
    },
    [coreData],
  );
  const getOrganization = useCallback(
    (id: string): OrganizationData | undefined => {
      const ent = coreData.ents[id];
      if (ent?.type === EntityType.Org) return ent;

      // Search with org. prefix
      const ent2 = coreData.ents[`org.${id}`];
      if (ent2?.type === EntityType.Org) return ent2;

      // Not found
      return undefined;
    },
    [coreData],
  );
  const getTechnology = useCallback(
    (id: string): TechnologyData | undefined => {
      const ent = coreData.ents[id];
      if (ent?.type === EntityType.Technology) return ent;

      // Search with tech. prefix
      const ent2 = coreData.ents[`tech.${id}`];
      if (ent2?.type === EntityType.Technology) return ent2;

      // Not found
      return undefined;
    },
    [coreData],
  );
  const world = coreData.ents['001'] as TerritoryData | undefined;

  useEffect(() => {
    if (world == null) return;

    // Update dependent fields whenever language source or locale separator changes
    updateEntitiesBasedOnDataParams(
      coreData.languages,
      coreData.locales,
      world,
      languageSource,
      localeSeparator,
    );

    if (loadProgress === LoadingStage.HasSupplementalData)
      setLoadProgress(LoadingStage.AlgorithmsFinished);
    setDataRevision((prev) => prev + 1);
  }, [languageSource, localeSeparator, loadProgress]);

  const dataContext = useMemo(
    () => ({
      ...coreData,
      loadingStage: loadProgress,
      dataRevision,
      getEntity,
      getLanguage,
      getCLDRLanguage,
      getLocale,
      getTerritory,
      getWritingSystem,
      getVariant,
      getOrganization,
      getTechnology,
    }),
    [coreData, loadProgress, dataRevision],
  );

  // After the main load, load additional data
  useEffect(() => {
    if (loadProgress === LoadingStage.HasCoreData) {
      const loadSecondaryData = async (dataContext: DataContextType) => {
        await loadSupplementalData(dataContext);
        setLoadProgress(LoadingStage.HasSupplementalData);
      };

      loadSecondaryData(dataContext);
    }
  }, [dataContext, loadProgress]); // this is called once after page load

  return <DataContext.Provider value={dataContext}>{children}</DataContext.Provider>;
};

export default DataProvider;
