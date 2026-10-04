import React, { useCallback, useEffect, useMemo, useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import type { LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { type EntityData, EntityType } from '@entities/types/EntityTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { updateEntitiesBasedOnDataParams } from '../compute/updateEntitiesBasedOnDataParams';
import { type CoreDataArrays, useCoreData } from '../load/CoreData';
import { loadSupplementalData } from '../load/SupplementalData';

import LoadingStage from './LoadingStage';
import { DataContext, DataGetters } from './useDataContext';

// Create a provider component
const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { languageSource, localeSeparator } = usePageParams();
  const { coreData, loadCoreData } = useCoreData();
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(LoadingStage.Initial);

  useEffect(() => {
    const loadPrimaryData = async () => {
      await loadCoreData();
      setLoadingStage(LoadingStage.HasCoreData);
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

  const dataContextBase = useMemo(
    () => ({
      ...coreData,
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
    [coreData],
  );

  // After the main load, load additional data
  useEffect(() => {
    if (loadingStage === LoadingStage.HasCoreData) {
      const loadSecondaryData = async (dataContext: CoreDataArrays & DataGetters) => {
        await loadSupplementalData(dataContext)
          .then(() => {
            setLoadingStage(LoadingStage.HasSupplementalData);
          })
          .catch((error) => {
            console.error('Error loading supplemental data:', error);
          });
      };

      loadSecondaryData(dataContextBase);
    }
  }, [dataContextBase, loadingStage]); // this is called once after page load

  // After supplemental data has been loaded, then update the entity populations, names, and other param dependent fields.
  // Do this again if the language source or locale separator changes
  useEffect(() => {
    if (world == null) return;
    if (loadingStage < LoadingStage.HasSupplementalData) return; // aren't ready yet
    if (loadingStage === LoadingStage.AlgorithmsFinished) return; // already computed algorithms

    // Update dependent fields whenever language source or locale separator changes
    updateEntitiesBasedOnDataParams(
      coreData.languages,
      coreData.locales,
      world,
      languageSource,
      localeSeparator,
    );

    setLoadingStage(LoadingStage.AlgorithmsFinished);
  }, [coreData, loadingStage, world]);

  // Trigger the recomputation of algorithms if the language source or locale separator changes
  useEffect(() => {
    if (loadingStage === LoadingStage.AlgorithmsFinished)
      setLoadingStage(LoadingStage.RecomputingAlgorithms);
  }, [languageSource, localeSeparator]);

  return (
    <DataContext.Provider value={{ ...dataContextBase, loadingStage, dataRevision: -1 }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
