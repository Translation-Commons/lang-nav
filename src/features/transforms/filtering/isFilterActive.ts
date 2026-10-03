import { PageParams } from '@features/params/PageParamTypes';
import { POPULATION_MAX } from '@features/params/Profiles';

import { LanguageSource } from '@entities/language/LanguageTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import Field from '../fields/Field';
import { FilterField } from '../fields/FieldApplicability';

function isFilterActive(field: FilterField, params: PageParams) {
  switch (field) {
    case Field.WritingSystem:
      return params.writingSystemFilter !== '';
    case Field.LanguageList:
      return params.languageFilter !== '';
    case Field.LanguageFamily:
      return params.languageFamilyFilter !== '';
    case Field.Organization:
      return params.orgFilter !== '';
    case Field.Population:
      return (
        params.populationMin >= 0 ||
        (params.populationMax < POPULATION_MAX && params.populationMax >= 0)
      );
    case Field.Name:
      return params.searchString !== '';
    case Field.Modality:
      return params.modalityFilter.length > 0;
    case Field.SourceForLanguage:
      return params.languageSource !== LanguageSource.Combined;
    case Field.LanguageScope:
      return params.languageScopes.length > 0;
    case Field.TerritoryScope:
      return params.territoryScopes.length > 0;
    case Field.TerritoryList:
      return params.territoryFilter !== '';
    case Field.ISOStatus:
      return params.isoStatus.length > 0;
    default:
      enforceExhaustiveSwitch(field);
  }
}

export default isFilterActive;
