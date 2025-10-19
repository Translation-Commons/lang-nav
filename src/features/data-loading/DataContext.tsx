import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LocaleSeparator, ObjectType } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';
import { getLocaleCode, getLocaleName } from '@entities/locale/LocaleStrings';
import {
  LocaleData,
  ObjectData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import { CoreDataArrays, useCoreData } from './CoreData';
import { loadSupplementalData } from './SupplementalData';

type DataGetters = {
  getObject(id: string): ObjectData | undefined;
  getLanguage: (id: string) => LanguageData | undefined;
  getLocale: (id: string) => LocaleData | undefined;
  getTerritory: (id: string) => TerritoryData | undefined;
  getWritingSystem: (id: string) => WritingSystemData | undefined;
  getVariantTag: (id: string) => VariantTagData | undefined;
};

export type DataContextType = CoreDataArrays &
  DataGetters & {
    languagesInSelectedSource: LanguageData[];
  };

const DataContext = createContext<DataContextType | undefined>({
  allLanguoids: [],
  censuses: {},
  languagesInSelectedSource: [],
  locales: [],
  territories: [],
  variantTags: [],
  writingSystems: [],
  getObject: () => undefined,
  getLanguage: () => undefined,
  getLocale: () => undefined,
  getTerritory: () => undefined,
  getWritingSystem: () => undefined,
  getVariantTag: () => undefined,
});

// Create a provider component
export const DataProvider: React.FC<{
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

export function updateLanguagesBasedOnSource(
  languages: LanguageData[],
  locales: LocaleData[],
  languageSource: LanguageSource,
  localeSeparator: LocaleSeparator,
): void {
  // Update language codes and other values used for filtering
  languages.forEach((lang) => {
    const specific = lang.sourceSpecific[languageSource];
    lang.codeDisplay = specific.code ?? lang.ID;
    lang.nameDisplay = specific.name ?? lang.nameCanonical;
    lang.names = uniqueBy(
      [
        lang.nameCanonical,
        lang.nameEndonym,
        ...Object.values(lang.sourceSpecific).map((l) => l.name),
      ].filter((s) => s != null),
      (s) => s,
    );
    lang.scope = specific.scope ?? lang.scope;
    lang.populationOfDescendents = specific.populationOfDescendents ?? undefined;
    lang.populationEstimate = lang.populationCited ?? specific.populationOfDescendents;
    lang.parentLanguage = specific.parentLanguage ?? undefined;
    lang.childLanguages = specific.childLanguages ?? [];
  });

  // Update locales too, their codes and their names
  Object.values(locales).forEach((loc) => {
    loc.codeDisplay = getLocaleCode(loc, localeSeparator);
    const localeName = getLocaleName(loc);
    loc.nameDisplay = localeName; // Set the display name

    // Add it to the names array so it can be used in search
    if (!loc.names.includes(localeName)) loc.names.push(localeName);
  });
}

// Custom hook for easier usage
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};

export default DataProvider;
