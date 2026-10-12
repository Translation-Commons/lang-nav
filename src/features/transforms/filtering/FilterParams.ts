import { PageParams } from '@features/params/PageParamTypes';
import { POPULATION_MAX } from '@features/params/Profiles';

// Most filters are
export const BLANK_FILTER_PARAMS: Partial<PageParams> = {
  isoStatus: [],
  languageFilter: '',
  languageFamilyFilter: '',
  languageScopes: [],
  //   languageSource: LanguageSource; // Allowed to propagate
  modalityFilter: [],
  orgFilter: '',
  populationMax: POPULATION_MAX,
  populationMin: -1,
  searchString: '',
  territoryFilter: '',
  territoryScopes: [],
  writingSystemFilter: '',
};
