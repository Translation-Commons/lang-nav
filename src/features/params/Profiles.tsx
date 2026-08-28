import {
  Building2Icon,
  ExpandIcon,
  LandmarkIcon,
  LaughIcon,
  PersonStandingIcon,
  SchoolIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

import ReportID from '@widgets/reports/ReportID';

import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import getColorGradientForField from '@features/transforms/coloring/getColorGradientForField';
import Field from '@features/transforms/fields/Field';
import getFieldForPopulationFocus from '@features/transforms/fields/getFieldForPopulationFocus';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import { EntityType, LocaleSeparator, PageParams, SearchableField, View } from './PageParamTypes';

export enum ProfileType {
  LanguageEthusiast = 'Language Enthusiast', // Default
  CommunityMember = 'Community Member', // Different intro experience
  Academic = 'Academic', // ISO, Table view
  TechDeveloper = 'Tech Developer', // CLDR, Table view
  PolicyMaker = 'Policy Maker', // UNESCO,
  ShowMeEverything = 'Show Me Everything', // Inclusive, all territories, all languages
  // TODO add custom profile
}

const GLOBAL_DEFAULTS: PageParams = {
  colorBy: Field.None,
  colorGradient: ColorGradient.DivergingBlueToOrange,
  columns: {},
  fieldFocus: Field.None,
  isoStatus: [],
  languageFilter: '',
  languageFamilyFilter: '',
  languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
  languageSource: LanguageSource.Combined,
  limit: 12,
  localeSeparator: LocaleSeparator.Underscore,
  modalityFilter: [],
  entID: undefined,
  entType: EntityType.Language,
  page: 1,
  pinned: [],
  profile: ProfileType.LanguageEthusiast,
  populationFocus: PopulationFocus.Overall,
  populationMax: 10_000_000_000, // higher than the world population
  populationMin: -1, // allow undefined population as well as definite 0s
  reportID: ReportID.EntitiesMissingFields,
  scaleBy: Field.None,
  searchBy: SearchableField.CodeOrNameAny,
  searchString: '',
  secondarySortBy: Field.None,
  sortBehavior: SortBehavior.Normal,
  sortBy: Field.Population,
  territoryFilter: '',
  territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
  view: View.CardList,
  writingSystemFilter: '',
};

export const DEFAULTS_BY_PROFILE: Record<ProfileType, Partial<PageParams>> = {
  [ProfileType.LanguageEthusiast]: {
    // Nothing, default profile is based on this
  },
  [ProfileType.CommunityMember]: {
    languageScopes: [], // Shorthand for all languoids
    searchString: '', // Default to empty search but included here since its an important filter
  },
  [ProfileType.Academic]: {
    view: View.Table,
    languageSource: LanguageSource.ISO,
  },
  [ProfileType.TechDeveloper]: {
    view: View.Table,
    languageSource: LanguageSource.CLDR,
    populationFocus: PopulationFocus.Writing,
    territoryFilter: '', // Default to none but included here since its an important filter
  },
  [ProfileType.PolicyMaker]: {
    languageSource: LanguageSource.UNESCO,
    territoryFilter: '', // Default to none but included here since its an important filter
  },
  [ProfileType.ShowMeEverything]: {
    languageSource: LanguageSource.Combined,
    languageScopes: [], // Shorthand for all languoids
    territoryScopes: [], // Shorthand for all territories
    limit: 200, // Show more results
  },
};

export function getDefaultParams(
  entType?: EntityType,
  view?: View | undefined,
  profile?: ProfileType | undefined,
  populationFocus?: PopulationFocus | undefined,
  colorBy?: Field,
): PageParams {
  let params = GLOBAL_DEFAULTS;

  // Merge global defaults with profile-specific defaults
  if (profile != null) {
    params = { ...params, ...DEFAULTS_BY_PROFILE[profile] };
    params.profile = profile;
  }

  // Clone to avoid mutating the defaults (eg. arrays)
  params = structuredClone(params);

  // Directly set the view & entType if provided
  if (view != null) params.view = view;
  if (entType != null) params.entType = entType;
  if (populationFocus != null) params.populationFocus = populationFocus;
  if (colorBy != null) params.colorBy = colorBy;

  // Apply a few view-specific overrides
  switch (params.view) {
    case View.Hierarchy:
      // Show parents in the hierarchy that we usually do not show
      if (params.entType === EntityType.Language) params.languageScopes.push(LanguageScope.Family);
      if (params.entType === EntityType.Territory)
        params.territoryScopes = Object.values(TerritoryScope).filter((s) => typeof s === 'number');
      break;
    case View.Table:
      // Show more results in table view since it's easier to scan
      params.limit = 200;
      break;
    case View.Map:
      // Show more results in map view since it's easier to view
      params.limit = 200;

      // Add default colorBys since we're showing X in territories
      if (params.colorBy === Field.None) {
        if (params.entType === EntityType.Census) params.colorBy = Field.CountOfCensuses;
        if (params.entType === EntityType.Locale)
          params.colorBy = Field.PercentOfTerritoryPopulation;
        if (params.entType === EntityType.WritingSystem)
          params.colorBy = Field.CountOfWritingSystems;
      }
      break;
    case View.Reports:
      // Reports easily become too dense, so we limit them more aggressively by default
      params.limit = 10;
      break;
  }

  // Get default gradient for colorBys
  if (params.colorBy !== Field.None) {
    params.colorGradient = getColorGradientForField(params.colorBy);
  }

  // Set population sorting behavior
  if (params.entType === EntityType.Org) {
    // Orgs don't have population, so sort by count of censuses by default
    if (params.sortBy === Field.Population) params.sortBy = Field.CountOfCensuses;
    if (params.secondarySortBy === Field.Population) params.secondarySortBy = Field.CountOfCensuses;
  } else if (params.entType === EntityType.Keyboard) {
    // Keyboards don't have population, so sort by name by default
    if (params.sortBy === Field.Population) params.sortBy = Field.Name;
    if (params.secondarySortBy === Field.Population) params.secondarySortBy = Field.Name;
  } else if (params.entType === EntityType.WritingSystem) {
    // For writing sytems, the population == population (writing) but its more accurate to refer to it as the writing population
    if (params.sortBy === Field.Population) params.sortBy = Field.PopulationWriting;
    if (params.secondarySortBy === Field.Population)
      params.secondarySortBy = Field.PopulationWriting;
  } else if (params.sortBy === Field.Population) {
    // If there is a specified population focus, the default sort should make the population focus.
    if (populationFocus != null) {
      if (params.sortBy === Field.Population)
        params.sortBy = getFieldForPopulationFocus(populationFocus);
      // Note: Secondary sort by remains as population (overall) for tie-breaking
    }
  }

  return params;
}

export function getProfileIcon(profile: ProfileType, color: string): ReactNode {
  switch (profile) {
    case ProfileType.LanguageEthusiast:
      return <LaughIcon size={64} color={color} />;
    case ProfileType.CommunityMember:
      return <PersonStandingIcon size={64} color={color} />;
    case ProfileType.Academic:
      return <SchoolIcon size={64} color={color} />;
    case ProfileType.TechDeveloper:
      return <Building2Icon size={64} color={color} />;
    case ProfileType.PolicyMaker:
      return <LandmarkIcon size={64} color={color} />;
    case ProfileType.ShowMeEverything:
      return <ExpandIcon size={64} color={color} />;
  }
}
