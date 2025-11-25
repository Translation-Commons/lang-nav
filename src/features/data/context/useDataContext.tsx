import { createContext, useContext } from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  ObjectData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { CoreDataArrays } from '../load/CoreData';

type DataGetters = {
  getObject(id: string): ObjectData | undefined;
  getLanguage: (id: string) => LanguageData | undefined;
  getCLDRLanguage: (id: string) => LanguageData | undefined;
  getLocale: (id: string) => LocaleData | undefined;
  getTerritory: (id: string) => TerritoryData | undefined;
  getWritingSystem: (id: string) => WritingSystemData | undefined;
  getVariantTag: (id: string) => VariantTagData | undefined;
};

export type DataContextType = CoreDataArrays &
  DataGetters & {
    languagesInSelectedSource: LanguageData[];
  };

export const DataContext = createContext<DataContextType | undefined>({
  allLanguoids: [],
  censuses: {},
  languagesInSelectedSource: [],
  locales: [],
  territories: [],
  variantTags: [],
  writingSystems: [],
  getCLDRLanguage: () => undefined,
  getObject: () => undefined,
  getLanguage: () => undefined,
  getLocale: () => undefined,
  getTerritory: () => undefined,
  getWritingSystem: () => undefined,
  getVariantTag: () => undefined,
});

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};
