import { ProfileType } from '../controls/Profiles';

import { TerritoryScope } from './DataTypes';
import { LanguageSource, LanguageScope } from './LanguageTypes';

export enum ObjectType {
  Language = 'Language',
  Locale = 'Locale',
  Census = 'Census',
  Territory = 'Territory',
  WritingSystem = 'Writing System',
  VariantTag = 'Variant Tag',
}

export enum View {
  CardList = 'Cards',
  Details = 'Details',
  Hierarchy = 'Hierarchy',
  Table = 'Table',
  Reports = 'Reports',
}

export enum SortBy {
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',
  Endonym = 'Endonym',
  CountOfLanguages = 'Count of Languages',
  CountOfTerritories = 'Count of Territories',
  RelativePopulation = 'Relative Population',
  Literacy = 'Literacy',
}

export enum SearchableField {
  Code = 'ID',
  NameOrCode = 'English Name or ID',
  EngName = 'English Name',
  Endonym = 'Endonym',
  AllNames = 'All Names',
}

export enum LocaleSeparator {
  Underscore = '_',
  Hyphen = '-',
}

export type PageParamKey =
  | 'languageSource'
  | 'languageScopes'
  | 'limit'
  | 'localeSeparator'
  | 'objectID'
  | 'objectType'
  | 'page'
  | 'profile'
  | 'searchBy'
  | 'searchString'
  | 'sortBy'
  | 'sortDirection'
  | 'territoryFilter'
  | 'territoryScopes'
  | 'view';

export type PageParams = {
  languageScopes: LanguageScope[];
  languageSource: LanguageSource;
  limit: number; // < 1 means show all
  localeSeparator: LocaleSeparator;
  objectID?: string;
  objectType: ObjectType;
  page: number; // 0 indexed
  profile: ProfileType;
  searchBy: SearchableField;
  searchString: string;
  sortBy: SortBy;
  sortDirection: 'normal' | 'reverse'; // true for normal, false for reverse
  territoryFilter: string;
  territoryScopes: TerritoryScope[];
  view: View;
};

export type PageParamsOptional = {
  languageScopes?: LanguageScope[];
  languageSource?: LanguageSource;
  limit?: number;
  localeSeparator?: LocaleSeparator;
  objectID?: string;
  objectType?: ObjectType;
  page?: number;
  profile?: ProfileType;
  searchBy?: SearchableField;
  searchString?: string;
  sortBy?: SortBy;
  sortDirection?: 'normal' | 'reverse';
  territoryFilter?: string;
  territoryScopes?: TerritoryScope[];
  view?: View;
};
