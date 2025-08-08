import {
  Building2Icon,
  ExpandIcon,
  LandmarkIcon,
  LaughIcon,
  PersonStandingIcon,
  SchoolIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

import { TerritoryScope } from '../types/DataTypes';
import { LanguageSource, LanguageScope } from '../types/LanguageTypes';
import {
  LocaleSeparator,
  ObjectType,
  PageParams,
  PageParamsOptional,
  SearchableField,
  SortBy,
  View,
} from '../types/PageParamTypes';

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
  languageSource: LanguageSource.All,
  languageScopes: [LanguageScope.Macrolanguage, LanguageScope.Language],
  limit: 12,
  localeSeparator: LocaleSeparator.Underscore,
  objectID: undefined,
  objectType: ObjectType.Language,
  page: 1,
  profile: ProfileType.LanguageEthusiast,
  searchBy: SearchableField.AllNames,
  searchString: '',
  sortBy: SortBy.Population,
  sortDirection: 'normal',
  territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
  territoryFilter: '',
  view: View.CardList,
};

export const DEFAULTS_BY_PROFILE: Record<ProfileType, PageParamsOptional> = {
  [ProfileType.LanguageEthusiast]: {
    // Nothing, default profile is based on this
  },
  [ProfileType.CommunityMember]: {
    view: View.Details,
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
    languageSource: LanguageSource.All,
    languageScopes: [], // Shorthand for all languoids
    territoryScopes: [], // Shorthand for all territories
    limit: 200, // Show more results
  },
};

export function getDefaultParams(
  objectType?: ObjectType,
  view?: View | undefined,
  profile?: ProfileType | undefined,
): PageParams {
  let defaults = GLOBAL_DEFAULTS;
  if (profile != null) {
    defaults = {
      ...defaults,
      ...DEFAULTS_BY_PROFILE[profile],
    };
    defaults.profile = profile;
  }
  if (view != null) {
    defaults.view = view;
  }
  // Apply a few view-specific defaults
  if (defaults.view === View.Hierarchy) {
    if (objectType === ObjectType.Language) defaults.languageScopes.push(LanguageScope.Family);
    if (objectType === ObjectType.Territory)
      defaults.territoryScopes = Object.values(TerritoryScope);
  } else if (defaults.view === View.Table) {
    defaults.limit = 200; // Show more results in table view
  }
  return defaults;
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
