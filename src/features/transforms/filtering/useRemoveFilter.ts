import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

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
    case Field.SourceForLanguage:
      return { languageSource: undefined };
    case Field.LanguageScope:
      return { languageScopes: [] };
    case Field.Modality:
      return { modalityFilter: undefined };
    case Field.TerritoryScope:
      return { territoryScopes: [] };
    case Field.TerritoryList:
      return { territoryFilter: undefined };
    case Field.WritingSystem:
      return { writingSystemFilter: undefined };
    case Field.LanguageFamily:
      return { languageFamilyFilter: undefined };
    case Field.LanguageList:
      return { languageFilter: undefined };
    case Field.ISOStatus:
      return { isoStatus: undefined };
    case Field.Population:
      return { populationMax: undefined, populationMin: undefined };
    case Field.Name:
      return { searchString: undefined };
    case Field.Organization:
      return { orgFilter: undefined };
    default:
      return {};
  }
}

export default useRemoveFilter;
