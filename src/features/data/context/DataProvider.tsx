import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { updateObjectsBasedOnDataParams } from '../compute/updateObjectsBasedOnDataParams';
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

  useEffect(() => {
    const loadPrimaryData = async () => {
      await loadCoreData();
      setLoadProgress(LoadingStage.HasCoreData);
    };
    loadPrimaryData();
  }, []); // this is called once after page load

  const getObject = useCallback(
    (id: string): EntityData | undefined => coreData.ents[id],
    [coreData],
  );
  const getLanguage = useCallback(
    (id: string): LanguageData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Language ? (ent as LanguageData) : undefined;
    },
    [coreData],
  );
  const getCLDRLanguage = useCallback(
    (id: string): LanguageData | undefined => {
      return coreData.allLanguoids.find((lang) => lang.CLDR?.code === id);
    },
    [coreData],
  );
  const getLocale = useCallback(
    (id: string): LocaleData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Locale ? (ent as LocaleData) : undefined;
    },
    [coreData],
  );
  const getTerritory = useCallback(
    (id: string): TerritoryData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Territory ? (ent as TerritoryData) : undefined;
    },
    [coreData],
  );
  const getWritingSystem = useCallback(
    (id: string): WritingSystemData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.WritingSystem ? (ent as WritingSystemData) : undefined;
    },
    [coreData],
  );
  const getVariant = useCallback(
    (id: string): VariantData | undefined => {
      const ent = coreData.ents[id];
      return ent?.type === EntityType.Variant ? (ent as VariantData) : undefined;
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
  const languagesInSelectedSource = useMemo(() => {
    // Update dependent fields whenever language source or locale separator changes
    updateObjectsBasedOnDataParams(
      coreData.allLanguoids,
      coreData.locales,
      coreData.ents['001'] as TerritoryData, // The world territory
      languageSource,
      localeSeparator,
    );
    if (loadProgress === LoadingStage.HasSupplementalData)
      setLoadProgress(LoadingStage.AlgorithmsFinished);

    return coreData.allLanguoids.filter((lang) => lang[languageSource].code != null);
  }, [coreData, languageSource, localeSeparator, loadProgress]);

  const dataContext = useMemo(
    () => ({
      ...coreData,
      languagesInSelectedSource,
      loadingStage: loadProgress,
      getObject,
      getLanguage,
      getCLDRLanguage,
      getLocale,
      getTerritory,
      getWritingSystem,
      getVariant,
      getOrganization,
    }),
    [coreData, loadProgress],
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
