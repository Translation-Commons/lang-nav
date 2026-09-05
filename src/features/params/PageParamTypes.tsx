import ReportID from '@widgets/reports/ReportID';

import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import { ProfileType } from './Profiles';

export enum EntityType {
  Language = 'Language',
  Locale = 'Locale',
  Territory = 'Territory',
  WritingSystem = 'Writing System',
  Census = 'Census',
  Variant = 'Variant',
  Keyboard = 'Keyboard',
  Org = 'Organization',
}

export enum View {
  CardList = 'Cards',
  Table = 'Table',
  Hierarchy = 'Hierarchy',
  Map = 'Map',
  Reports = 'Reports',
  Details = 'Details',
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
  cmpID = 'cmpID',
  colorBy = 'colorBy',
  colorGradient = 'colorGradient',
  columns = 'columns',
  fieldFocus = 'fieldFocus',
  isoStatus = 'isoStatus',
  languageFamilyFilter = 'languageFamilyFilter',
  languageFilter = 'languageFilter',
  languageScopes = 'languageScopes',
  languageSource = 'languageSource',
  limit = 'limit',
  localeSeparator = 'localeSeparator',
  modalityFilter = 'modalityFilter',
  entID = 'entID',
  entType = 'entType',
  page = 'page',
  pinned = 'pinned',
  populationFocus = 'populationFocus',
  populationMax = 'populationMax',
  populationMin = 'populationMin',
  profile = 'profile',
  reportID = 'reportID',
  scaleBy = 'scaleBy',
  searchBy = 'searchBy',
  searchString = 'searchString',
  secondarySortBy = 'secondarySortBy',
  sortBehavior = 'sortBehavior',
  sortBy = 'sortBy',
  territoryFilter = 'territoryFilter',
  territoryScopes = 'territoryScopes',
  view = 'view',
  writingSystemFilter = 'writingSystemFilter',
}

export type PageParams = {
  cmpID: string;
  colorBy: Field;
  scaleBy: Field;
  colorGradient: ColorGradient;
  columns: TableIDToBinarizedColumnVisibility;
  isoStatus: LanguageISOStatus[];
  fieldFocus: Field; // To see data but not necessarily sort or color by it
  languageFilter: string;
  languageFamilyFilter: string;
  languageScopes: LanguageScope[];
  modalityFilter: LanguageModality[];
  languageSource: LanguageSource;
  limit: number; // < 1 means show all
  localeSeparator: LocaleSeparator;
  entID?: string;
  entType: EntityType;
  page: number; // 1 indexed
  pinned: string[];
  populationFocus: PopulationFocus;
  populationMax: number;
  populationMin: number;
  profile: ProfileType;
  reportID: ReportID;
  searchBy: SearchableField;
  searchString: string;
  secondarySortBy: Field;
  sortBehavior: SortBehavior;
  sortBy: Field;
  territoryFilter: string;
  territoryScopes: TerritoryScope[];
  view: View;
  writingSystemFilter: string;
};
