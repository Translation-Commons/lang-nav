import { LanguageSchema } from './LanguageTypes';
import { ScopeLevel } from './ScopeLevel';

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
  About = 'About',
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
  Territory = 'Territory',
}

export type LocaleSeparator = '-' | '_';

export type PageParamKey =
  | 'objectType'
  | 'languageSchema'
  | 'limit'
  | 'localeSeparator'
  | 'objectID'
  | 'page'
  | 'scopes'
  | 'searchString'
  | 'searchBy'
  | 'sortBy'
  | 'view';

export type PageParams = {
  languageSchema: LanguageSchema;
  limit: number; // < 1 means show all
  localeSeparator: LocaleSeparator;
  objectID?: string;
  objectType: ObjectType;
  page: number; // 0 indexed
  scopes: ScopeLevel[];
  searchBy: SearchableField;
  searchString: string;
  sortBy: SortBy;
  view: View;
};

export type PageParamsOptional = {
  languageSchema?: LanguageSchema;
  limit?: number;
  localeSeparator?: string;
  objectID?: string;
  objectType?: ObjectType;
  page?: number;
  scopes?: ScopeLevel[];
  searchBy?: SearchableField;
  searchString?: string;
  sortBy?: SortBy;
  view?: View;
};
