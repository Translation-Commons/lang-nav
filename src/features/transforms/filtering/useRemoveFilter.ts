import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';

import Field from '../fields/Field';

const useRemoveFilter = () => {
  const { updatePageParams } = usePageParams();
  const removeFilter = (field: Field) => {
    updatePageParams(getRemoveFilterParams(field));
  };

  return removeFilter;
};

function getRemoveFilterParams(field: Field): Partial<PageParams> {
  switch (field) {
    case Field.LanguageScope:
      return { languageScopes: [] };
    case Field.Modality:
      return { modalityFilter: [] };
    case Field.TerritoryScope:
      return { territoryScopes: [] };
    case Field.ISOStatus:
      return { isoStatus: [] };
    case Field.TerritoryList:
      return { territoryFilter: '' };
    case Field.WritingSystem:
      return { writingSystemFilter: '' };
    case Field.LanguageFamily:
      return { languageFamilyFilter: '' };
    case Field.LanguageList:
      return { languageFilter: '' };
    case Field.Name:
      return { searchString: '' };
    case Field.Organization:
      return { orgFilter: '' };
    case Field.Population:
      return { populationMax: undefined, populationMin: undefined };
    case Field.SourceForLanguage:
      return { languageSource: LanguageSource.Combined };
    default:
      return {};
  }
}

export default useRemoveFilter;
