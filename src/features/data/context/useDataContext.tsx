import { createContext, useContext } from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { CoreDataArrays } from '../load/CoreData';

import LoadingStage from './LoadingStage';

type DataGetters = {
  getObject(id: string): ObjectData | undefined;
  getLanguage: (id: string) => LanguageData | undefined;
  getCLDRLanguage: (id: string) => LanguageData | undefined;
  getLocale: (id: string) => LocaleData | undefined;
  getTerritory: (id: string) => TerritoryData | undefined;
  getWritingSystem: (id: string) => WritingSystemData | undefined;
  getVariant: (id: string) => VariantData | undefined;
  getOrganization: (id: string) => OrganizationData | undefined;
};

export type DataContextType = CoreDataArrays &
  DataGetters & {
    languagesInSelectedSource: LanguageData[];
    loadingStage: LoadingStage;
  };

export const DataContext = createContext<DataContextType | undefined>({
  loadingStage: LoadingStage.Initial,
  allLanguoids: [],
  censuses: {},
  organizations: [],
  languagesInSelectedSource: [],
  locales: [],
  territories: [],
  variants: [],
  writingSystems: [],
  keyboards: [],
  getCLDRLanguage: () => undefined,
  getObject: () => undefined,
  getLanguage: () => undefined,
  getLocale: () => undefined,
  getTerritory: () => undefined,
  getWritingSystem: () => undefined,
  getVariant: () => undefined,
  getOrganization: () => undefined,
});

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};
