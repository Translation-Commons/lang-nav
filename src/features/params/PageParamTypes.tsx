import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

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
  Keyboard = 'Keyboard',
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
  NameEthnologue = 'Ethnologue Name',
}

export enum LocaleSeparator {
  Underscore = '_',
  Hyphen = '-',
}

export type TableIDToBinarizedColumnVisibility = { [key: number]: bigint };

export enum PageParamKey {
  colorBy = 'colorBy',
  colorGradient = 'colorGradient',
  columns = 'columns',
  isoStatus = 'isoStatus',
  fieldFocus = 'fieldFocus',
  languageFilter = 'languageFilter',
  languageScopes = 'languageScopes',
  languageSource = 'languageSource',
  limit = 'limit',
  localeSeparator = 'localeSeparator',
  modalityFilter = 'modalityFilter',
  objectID = 'objectID',
  objectType = 'objectType',
  page = 'page',
  profile = 'profile',
  scaleBy = 'scaleBy',
  searchBy = 'searchBy',
  searchString = 'searchString',
  secondarySortBy = 'secondarySortBy',
  sortBehavior = 'sortBehavior',
  sortBy = 'sortBy',
  territoryFilter = 'territoryFilter',
  territoryScopes = 'territoryScopes',
  view = 'view',
  vitalityEthCoarse = 'vitalityEthCoarse',
  vitalityEthFine = 'vitalityEthFine',
  writingSystemFilter = 'writingSystemFilter',
}

export type PageParams = {
  colorBy: Field;
  scaleBy: Field;
  colorGradient: ColorGradient;
  columns: TableIDToBinarizedColumnVisibility;
  isoStatus: LanguageISOStatus[];
  fieldFocus: Field; // To see data but not necessarily sort or color by it
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
  secondarySortBy: Field;
  sortBehavior: SortBehavior;
  sortBy: Field;
  territoryFilter: string;
  territoryScopes: TerritoryScope[];
  view: View;
  vitalityEthFine: VitalityEthnologueFine[];
  vitalityEthCoarse: VitalityEthnologueCoarse[];
  writingSystemFilter: string;
};

export type PageParamsOptional = {
  colorBy?: Field;
  colorGradient?: ColorGradient;
  columns?: TableIDToBinarizedColumnVisibility;
  isoStatus?: LanguageISOStatus[];
  fieldFocus?: Field;
  languageFilter?: string;
  languageScopes?: LanguageScope[];
  languageSource?: LanguageSource;
  limit?: number;
  localeSeparator?: LocaleSeparator;
  modalityFilter?: LanguageModality[];
  objectID?: string;
  objectType?: ObjectType;
  page?: number;
  profile?: ProfileType;
  scaleBy?: Field;
  searchBy?: SearchableField;
  searchString?: string;
  secondarySortBy?: Field;
  sortBehavior?: SortBehavior;
  sortBy?: Field;
  territoryFilter?: string;
  territoryScopes?: TerritoryScope[];
  view?: View;
  vitalityEthCoarse?: VitalityEthnologueCoarse[];
  vitalityEthFine?: VitalityEthnologueFine[];
  writingSystemFilter?: string;
};
