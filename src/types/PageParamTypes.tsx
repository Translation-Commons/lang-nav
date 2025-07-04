import { Granularity } from './GranularityTypes';
import { LanguageSchema } from './LanguageTypes';

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
  | 'granularities'
  | 'languageSchema'
  | 'limit'
  | 'localeSeparator'
  | 'objectID'
  | 'objectType'
  | 'page'
  | 'searchBy'
  | 'searchString'
  | 'sortBy'
  | 'view';

export type PageParams = {
  granularities: Granularity[];
  languageSchema: LanguageSchema;
  limit: number; // < 1 means show all
  localeSeparator: LocaleSeparator;
  objectID?: string;
  objectType: ObjectType;
  page: number; // 0 indexed
  searchBy: SearchableField;
  searchString: string;
  sortBy: SortBy;
  view: View;
};

export type PageParamsOptional = {
  granularities?: Granularity[];
  languageSchema?: LanguageSchema;
  limit?: number;
  localeSeparator?: string;
  objectID?: string;
  objectType?: ObjectType;
  page?: number;
  searchBy?: SearchableField;
  searchString?: string;
  sortBy?: SortBy;
  view?: View;
};
