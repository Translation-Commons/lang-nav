import React from 'react';

import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getFilterBysApplicableToObjectType } from '@features/transforms/fields/FieldApplicability';
import SearchBar from '@features/transforms/search/SearchBar';

import LanguageFilterSelector from './LanguageFilterSelector';
import LanguageModalitySelector from './LanguageModalitySelector';
import LanguageScopeSelector from './LanguageScopeSelector';
import TerritoryFilterSelector from './TerritoryFilterSelector';
import TerritoryScopeSelector from './TerritoryScopeSelector';
import { LanguageISOStatusSelector } from './VitalitySelector';
import WritingSystemFilterSelector from './WritingSystemFilterSelector';

type Props = { field: Field };

const FilterSelector: React.FC<Props> = ({ field }) => {
  switch (field) {
    case Field.Language:
      return <LanguageFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.Territory:
      return <TerritoryFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.WritingSystem:
      return <WritingSystemFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.Modality:
      return <LanguageModalitySelector />;
    case Field.LanguageScope:
      return <LanguageScopeSelector />;
    case Field.TerritoryScope:
      return <TerritoryScopeSelector />;
    case Field.ISOStatus:
      return <LanguageISOStatusSelector />;
    case Field.Name:
      return <SearchBar />; // Technically correct but not recommended usage
    default:
      return null;
  }
};

/**
 * Limits filters by the ones applicable to the current object type. For example, if we're
 * looking at censuses, we don't need to show filter for writing system because that does not
 * apply. Censuses would not show the filter for languages because that has not been set up yet.
 */
export const AllApplicableFilterSelectors: React.FC = () => {
  const { objectType } = usePageParams();
  const filterBys = getFilterBysApplicableToObjectType(objectType).filter((f) => f !== Field.None); // This shouldn't return the search bar

  return filterBys.map((filterBy) => <FilterSelector field={filterBy} key={filterBy} />);
};

export default FilterSelector;
