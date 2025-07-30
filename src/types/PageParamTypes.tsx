import { TerritoryScope } from './DataTypes';
import { LanguageSource, LanguageScope } from './LanguageTypes';

export enum ObjectType {
  Language = 'Language',
  Locale = 'Locale',
  Census = 'Census',
  Territory = 'Territory',
  WritingSystem = 'Writing System',
  // VariantTag = 'Variant Tag',
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
}

export enum SearchableField {
  Code = 'ID',
  NameOrCode = 'English Name or ID',
  EngName = 'English Name',
  Endonym = 'Endonym',
  AllNames = 'All Names',
}

export type LocaleSeparator = '-' | '_';

export type PageParamKey =
  | 'languageSource'
  | 'languageScopes'
  | 'limit'
  | 'localeSeparator'
  | 'objectID'
  | 'objectType'
  | 'page'
  | 'searchBy'
  | 'searchString'
  | 'sortBy'
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
  searchBy: SearchableField;
  searchString: string;
  sortBy: SortBy;
  territoryFilter: string;
  territoryScopes: TerritoryScope[];
  view: View;
};

export type PageParamsOptional = {
  languageScopes?: LanguageScope[];
  languageSource?: LanguageSource;
  limit?: number;
  localeSeparator?: string;
  objectID?: string;
  objectType?: ObjectType;
  page?: number;
  searchBy?: SearchableField;
  searchString?: string;
  sortBy?: SortBy;
  territoryFilter?: string;
  territoryScopes?: TerritoryScope[];
  view?: View;
};
