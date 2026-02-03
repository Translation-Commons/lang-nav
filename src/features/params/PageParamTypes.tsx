import { ColorBy, ColorGradient } from '@features/transforms/coloring/ColorTypes';
import { ScaleBy } from '@features/transforms/scales/ScaleTypes';
import { SortBehavior, SortBy } from '@features/transforms/sorting/SortTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
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
  Reports = 'Reports',
}

export enum SearchableField {
  CodeOrNameAny = 'Code & All Names',
  Code = 'ID',
  NameAny = 'All Names',
  NameEndonym = 'Endonym',

  NameDisplay = 'English Name', // Current name
  NameISO = 'ISO Name',
  NameCLDR = 'CLDR Name',
  NameGlottolog = 'Glottolog Name',
}

export enum LocaleSeparator {
  Underscore = '_',
  Hyphen = '-',
}

export type TableIDToBinarizedColumnVisibility = { [key: number]: bigint };

export enum PageParamKey {
  colorBy = 'colorBy',
  colorGradient = 'colorGradient',
  scaleBy = 'scaleBy',
  columns = 'columns',
  languageFilter = 'languageFilter',
  languageSource = 'languageSource',
  languageScopes = 'languageScopes',
  modalityFilter = 'modalityFilter',
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
  writingSystemFilter = 'writingSystemFilter',
  view = 'view',
  isoStatus = 'isoStatus',
  vitalityEth2013 = 'vitalityEth2013',
  vitalityEth2025 = 'vitalityEth2025',
}

export type PageParams = {
  colorBy: ColorBy;
  scaleBy: ScaleBy;
  colorGradient: ColorGradient;
  columns: TableIDToBinarizedColumnVisibility;
  isoStatus: LanguageISOStatus[];
  languageFilter: string;
  languageScopes: LanguageScope[];
  modalityFilter: LanguageModality[];
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
  vitalityEth2013: VitalityEthnologueFine[];
  vitalityEth2025: VitalityEthnologueCoarse[];
  writingSystemFilter: string;
};

export type PageParamsOptional = {
  colorBy?: ColorBy;
  scaleBy?: ScaleBy;
  colorGradient?: ColorGradient;
  columns?: TableIDToBinarizedColumnVisibility;
  isoStatus?: LanguageISOStatus[];
  languageFilter?: string;
  languageScopes?: LanguageScope[];
  modalityFilter?: LanguageModality[];
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
  vitalityEth2013?: VitalityEthnologueFine[];
  vitalityEth2025?: VitalityEthnologueCoarse[];
  writingSystemFilter?: string;
};
