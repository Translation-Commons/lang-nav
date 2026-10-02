import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { CoreDataArrays, useCoreData } from '../load/CoreData';
import { loadSupplementalData } from '../load/SupplementalData';

import LoadingStage from './LoadingStage';
import { DataContext, DataGetters } from './useDataContext';

// Create a provider component
const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { languageSource, localeSeparator } = usePageParams();
  const computedParams = useRef<{
    languageSource: typeof languageSource;
    localeSeparator: typeof localeSeparator;
  } | null>(null);
  const { coreData, loadCoreData } = useCoreData();
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(LoadingStage.Initial);
  const [dataRevision, setDataRevision] = useState<number>(0);

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
      console.log('Loading supplemental data...');
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
    const paramsChanged =
      computedParams.current == null ||
      computedParams.current.languageSource !== languageSource ||
      computedParams.current.localeSeparator !== localeSeparator;
    const shouldComputeAlgorithms =
      loadingStage === LoadingStage.HasSupplementalData ||
      (loadingStage === LoadingStage.AlgorithmsFinished && paramsChanged);
    if (!shouldComputeAlgorithms) return;

    console.log('Computing algorithms...', { languageSource, localeSeparator, loadingStage });
    // Update dependent fields whenever language source or locale separator changes
    updateEntitiesBasedOnDataParams(
      coreData.languages,
      coreData.locales,
      world,
      languageSource,
      localeSeparator,
    );

    computedParams.current = { languageSource, localeSeparator };
    if (loadingStage === LoadingStage.HasSupplementalData)
      setLoadingStage(LoadingStage.AlgorithmsFinished);
    setDataRevision((prev) => prev + 1);
  }, [coreData, languageSource, localeSeparator, loadingStage, world]);

  return (
    <DataContext.Provider value={{ ...dataContextBase, loadingStage, dataRevision }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
