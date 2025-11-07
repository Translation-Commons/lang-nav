import { ColorBy, ColorGradient, SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageSource, LanguageScope } from '@entities/language/LanguageTypes';
import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  VitalityISO,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/types/DataTypes';

import { ProfileType } from './Profiles';

export enum ExternalConcepts {
  LanguageFamily = 'Language Family',
  Language = 'Language',
  Dialect = 'Dialect',
  Orthography = 'Orthography',
  Locale = 'Locale',
  Census = 'Census',
  Territory = 'Territory',
  WritingSystem = 'Writing System',
}

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
  Table = 'Table',
  Hierarchy = 'Hierarchy',
  Map = 'Map',
  Details = 'Details',
  Reports = 'Reports',
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

export enum PageParamKey {
  colorBy = 'colorBy',
  colorGradient = 'colorGradient',
  languageSource = 'languageSource',
  languageScopes = 'languageScopes',
  limit = 'limit',
  localeSeparator = 'localeSeparator',
  objectID = 'objectID',
  objectType = 'objectType',
  page = 'page',
  profile = 'profile',
  searchBy = 'searchBy',
  searchString = 'searchString',
  sortBehavior = 'sortBehavior',
  sortBy = 'sortBy',
  territoryFilter = 'territoryFilter',
  territoryScopes = 'territoryScopes',
  view = 'view',
  vitalityISO = 'vitalityISO',
  vitalityEth2013 = 'vitalityEth2013',
  vitalityEth2025 = 'vitalityEth2025',
}

export type PageParams = {
  colorBy: ColorBy;
  colorGradient: ColorGradient;
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
  sortBehavior: SortBehavior;
  sortBy: SortBy;
  territoryFilter: string;
  territoryScopes: TerritoryScope[];
  view: View;
  vitalityISO: VitalityISO[];
  vitalityEth2013: VitalityEthnologueFine[];
  vitalityEth2025: VitalityEthnologueCoarse[];
};

export type PageParamsOptional = {
  colorBy?: ColorBy;
  colorGradient?: ColorGradient;
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
  sortBehavior?: SortBehavior;
  sortBy?: SortBy;
  territoryFilter?: string;
  territoryScopes?: TerritoryScope[];
  view?: View;
  vitalityISO?: VitalityISO[];
  vitalityEth2013?: VitalityEthnologueFine[];
  vitalityEth2025?: VitalityEthnologueCoarse[];
};
