import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  ObjectData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { useCoreData } from '../CoreData';
import { loadSupplementalData } from '../SupplementalData';

import { updateLanguagesBasedOnSource } from './updateLanguagesBasedOnSource';
import { DataContext, DataContextType } from './useDataContext';

// Create a provider component
const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { languageSource, localeSeparator } = usePageParams();
  const { coreData, loadCoreData } = useCoreData();
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const loadPrimaryData = async () => {
      await loadCoreData();
      setLoadProgress(1);
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
  const languagesInSelectedSource = useMemo(
    () => coreData.allLanguoids.filter((lang) => lang.sourceSpecific[languageSource] != null),
    [coreData, languageSource],
  );

  const dataContext = useMemo(
    () => ({
      ...coreData,
      languagesInSelectedSource,
      getObject,
      getLanguage,
      getLocale,
      getTerritory,
      getWritingSystem,
      getVariantTag,
    }),
    [coreData],
  );

  // After the main load, load additional data
  useEffect(() => {
    if (loadProgress === 1) {
      const loadSecondaryData = async (dataContext: DataContextType) => {
        await loadSupplementalData(dataContext);
        setLoadProgress(2);
      };

      loadSecondaryData(dataContext);
    }
  }, [dataContext, loadProgress]); // this is called once after page load

  useEffect(() => {
    updateLanguagesBasedOnSource(
      languagesInSelectedSource,
      coreData.locales,
      languageSource,
      localeSeparator,
    );
  }, [languageSource, loadProgress, localeSeparator]); // when core language data or the language source changes

  return <DataContext.Provider value={dataContext}>{children}</DataContext.Provider>;
};

export default DataProvider;
