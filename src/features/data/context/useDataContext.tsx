import { createContext, useContext } from 'react';

import type { LanguageData } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import type { EntityData } from '@entities/types/EntityTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import type { CoreDataArrays } from '../load/CoreData';

import LoadingStage from './LoadingStage';

export type DataGetters = {
  getEntity(id: string): EntityData | undefined;
  getLanguage: (id: string) => LanguageData | undefined;
  getCLDRLanguage: (id: string) => LanguageData | undefined;
  getLocale: (id: string) => LocaleData | undefined;
  getTerritory: (id: string) => TerritoryData | undefined;
  getWritingSystem: (id: string) => WritingSystemData | undefined;
  getVariant: (id: string) => VariantData | undefined;
  getOrganization: (id: string) => OrganizationData | undefined;
  getTechnology: (id: string) => TechnologyData | undefined;
};

export type DataVersionInfo = {
  loadingStage: LoadingStage;
  dataRevision: number;
};

export type DataContextType = CoreDataArrays & DataGetters & DataVersionInfo;

export const DataContext = createContext<DataContextType | undefined>({
  languages: [],
  censuses: {},
  organizations: [],
  locales: [],
  territories: [],
  variants: [],
  writingSystems: [],
  orthographies: [],
  keyboards: [],
  technologies: [],

  getCLDRLanguage: () => undefined,
  getEntity: () => undefined,
  getLanguage: () => undefined,
  getLocale: () => undefined,
  getTerritory: () => undefined,
  getWritingSystem: () => undefined,
  getVariant: () => undefined,
  getOrganization: () => undefined,
  getTechnology: () => undefined,

  loadingStage: LoadingStage.Initial,
  dataRevision: -1,
});

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};
