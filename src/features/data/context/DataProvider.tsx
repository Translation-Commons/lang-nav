import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  ObjectData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { updateObjectCodesNameAndPopulation } from '../compute/updateObjectCodesNameAndPopulation';
import { useCoreData } from '../load/CoreData';
import { loadSupplementalData } from '../load/SupplementalData';

import { DataContext, DataContextType } from './useDataContext';

enum LoadingStage {
  Initial,
  HasCoreData,
  HasSupplementalData,
  AlgorithmsFinished,
}

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
    (id: string): ObjectData | undefined => coreData.objects[id],
    [coreData],
  );
  const getLanguage = useCallback(
    (id: string): LanguageData | undefined => {
      const obj = coreData.objects[id];
      return obj?.type === ObjectType.Language ? (obj as LanguageData) : undefined;
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
      const obj = coreData.objects[id];
      return obj?.type === ObjectType.Locale ? (obj as LocaleData) : undefined;
    },
    [coreData],
  );
  const getTerritory = useCallback(
    (id: string): TerritoryData | undefined => {
      const obj = coreData.objects[id];
      return obj?.type === ObjectType.Territory ? (obj as TerritoryData) : undefined;
    },
    [coreData],
  );
  const getWritingSystem = useCallback(
    (id: string): WritingSystemData | undefined => {
      const obj = coreData.objects[id];
      return obj?.type === ObjectType.WritingSystem ? (obj as WritingSystemData) : undefined;
    },
    [coreData],
  );
  const getVariantTag = useCallback(
    (id: string): VariantTagData | undefined => {
      const obj = coreData.objects[id];
      return obj?.type === ObjectType.VariantTag ? (obj as VariantTagData) : undefined;
    },
    [coreData],
  );
  const languagesInSelectedSource = useMemo(() => {
    // Update dependent fields whenever language source or locale separator changes
    updateObjectCodesNameAndPopulation(
      coreData.allLanguoids,
      coreData.locales,
      coreData.objects['001'] as TerritoryData, // The world territory
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
      getObject,
      getLanguage,
      getCLDRLanguage,
      getLocale,
      getTerritory,
      getWritingSystem,
      getVariantTag,
    }),
    [coreData],
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
