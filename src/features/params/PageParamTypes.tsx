import ReportID from '@widgets/reports/ReportID';

import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
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
  Chart = 'Chart',
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
  chartX = 'chartX',
  chartY = 'chartY',
  cmpID = 'cmpID',
  colorBy = 'colorBy',
  colorGradient = 'colorGradient',
  columns = 'columns',
  entID = 'entID',
  entType = 'entType',
  fieldFocus = 'fieldFocus',
  isoStatus = 'isoStatus',
  languageFamilyFilter = 'languageFamilyFilter',
  languageFilter = 'languageFilter',
  languageScopes = 'languageScopes',
  languageSource = 'languageSource',
  limit = 'limit',
  localeSeparator = 'localeSeparator',
  modalityFilter = 'modalityFilter',
  page = 'page',
  pinned = 'pinned',
  populationFocus = 'populationFocus',
  populationMax = 'populationMax',
  populationMin = 'populationMin',
  profile = 'profile',
  reportID = 'reportID',
  scaleBy = 'scaleBy',
  scaleFactor = 'scaleFactor',
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
  columns: TableIDToBinarizedColumnVisibility;
  limit: number; // < 1 means show all
  localeSeparator: LocaleSeparator;
  entID?: string;
  entType: EntityType;
  page: number; // 1 indexed
  pinned: string[];
  populationFocus: PopulationFocus;
  profile: ProfileType;
  reportID: ReportID;
  searchBy: SearchableField;
  searchString: string;
  view: View;

  // Filters
  isoStatus: LanguageISOStatus[];
  languageFilter: string;
  languageFamilyFilter: string;
  languageScopes: LanguageScope[];
  languageSource: LanguageSource;
  modalityFilter: LanguageModality[];
  populationMax: number;
  populationMin: number;
  territoryFilter: string;
  territoryScopes: TerritoryScope[];
  writingSystemFilter: string;

  // Field Displays
  sortBy: Field;
  secondarySortBy: Field;
  sortBehavior: SortBehavior;
  colorBy: Field;
  colorGradient: ColorGradient;
  scaleBy: Field;
  scaleFactor: number;
  fieldFocus: Field; // To see data but not necessarily sort or color by it
  chartX: Field;
  chartY: Field;
};
