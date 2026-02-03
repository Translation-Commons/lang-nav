import {
  Building2Icon,
  ExpandIcon,
  LandmarkIcon,
  LaughIcon,
  PersonStandingIcon,
  SchoolIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

import { ColorBy, ColorGradient } from '@features/transforms/coloring/ColorTypes';
import getGradientForColorBy from '@features/transforms/coloring/getGradientForColorby';
import { ScaleBy } from '@features/transforms/scales/ScaleTypes';
import { SortBehavior, SortBy } from '@features/transforms/sorting/SortTypes';

import { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/types/DataTypes';

import {
  LocaleSeparator,
  ObjectType,
  PageParams,
  PageParamsOptional,
  SearchableField,
  View,
} from './PageParamTypes';

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
  colorBy: 'None',
  scaleBy: 'None',
  colorGradient: ColorGradient.DivergingBlueToOrange,
  columns: {},
  isoStatus: [],
  languageFilter: '',
  languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
  modalityFilter: [],
  languageSource: LanguageSource.Combined,
  limit: 12,
  localeSeparator: LocaleSeparator.Underscore,
  objectID: undefined,
  objectType: ObjectType.Language,
  page: 1,
  profile: ProfileType.LanguageEthusiast,
  searchBy: SearchableField.CodeOrNameAny,
  searchString: '',
  sortBehavior: SortBehavior.Normal,
  sortBy: SortBy.Population,
  territoryFilter: '',
  territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
  view: View.CardList,
  vitalityEth2013: [],
  vitalityEth2025: [],
  writingSystemFilter: '',
};

export const DEFAULTS_BY_PROFILE: Record<ProfileType, PageParamsOptional> = {
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
  objectType?: ObjectType,
  view?: View | undefined,
  profile?: ProfileType | undefined,
  colorBy?: ColorBy | undefined,
  scaleBy?: ScaleBy | undefined,
): PageParams {
  let params = GLOBAL_DEFAULTS;

  // Merge global defaults with profile-specific defaults
  if (profile != null) {
    params = { ...params, ...DEFAULTS_BY_PROFILE[profile] };
    params.profile = profile;
  }

  // Clone to avoid mutating the defaults
  params = structuredClone(params);

  // Directly set the view & objectType if provided
  if (view != null) params.view = view;
  if (objectType != null) params.objectType = objectType;
  if (colorBy != null) params.colorBy = colorBy;
  if (scaleBy != null) params.scaleBy = scaleBy;

  // Apply a few view-specific overrides
  if (params.view === View.Hierarchy) {
    if (params.objectType === ObjectType.Language) params.languageScopes.push(LanguageScope.Family);
    if (params.objectType === ObjectType.Territory)
      params.territoryScopes = Object.values(TerritoryScope);
  } else if (params.view === View.Table) {
    params.limit = 200; // Show more results in table view
  } else if (params.view === View.Map) {
    params.limit = 200; // Show more results in map view

    if (params.colorBy === 'None') {
      // Add default colorBys since we're showing X in territories
      if (params.objectType === ObjectType.Census) params.colorBy = SortBy.CountOfCensuses;
      if (params.objectType === ObjectType.Locale) params.colorBy = SortBy.CountOfLanguages;
      if (params.objectType === ObjectType.WritingSystem)
        params.colorBy = SortBy.CountOfWritingSystems;
    }
  }

  // Get default gradient for colorBys
  if (params.colorBy !== 'None') {
    params.colorGradient = getGradientForColorBy(params.colorBy);
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
