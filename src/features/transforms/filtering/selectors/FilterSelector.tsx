import React from 'react';

import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import LanguageSourceSelector from '@features/transforms/filtering/selectors/LanguageSourceSelector';
import SearchBar from '@features/transforms/search/SearchBar';
import TransformEnum from '@features/transforms/TransformEnum';

import LanguageFamilyFilterSelector from './LanguageFamilyFilterSelector';
import LanguageFilterSelector from './LanguageFilterSelector';
import LanguageModalitySelector from './LanguageModalitySelector';
import LanguageScopeSelector from './LanguageScopeSelector';
import PopulationFilterSelector from './PopulationFilterSelector';
import TerritoryFilterSelector from './TerritoryFilterSelector';
import TerritoryScopeSelector from './TerritoryScopeSelector';
import { LanguageISOStatusSelector } from './VitalitySelector';
import WritingSystemFilterSelector from './WritingSystemFilterSelector';

type Props = { field: Field };

const FilterSelector: React.FC<Props> = ({ field }) => {
  switch (field) {
    case Field.Language:
      return <LanguageFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.LanguageFamily:
      return <LanguageFamilyFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.Territory:
      return <TerritoryFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.WritingSystem:
      return <WritingSystemFilterSelector display={SelectorDisplay.ButtonList} />;
    case Field.Modality:
      return <LanguageModalitySelector display={SelectorDisplay.FilterList} />;
    case Field.LanguageScope:
      return <LanguageScopeSelector display={SelectorDisplay.FilterList} />;
    case Field.TerritoryScope:
      return <TerritoryScopeSelector display={SelectorDisplay.FilterList} />;
    case Field.ISOStatus:
      return <LanguageISOStatusSelector display={SelectorDisplay.FilterList} />;
    case Field.Name:
      return <SearchBar />; // Technically correct but not recommended usage
    case Field.SourceForLanguage:
      return <LanguageSourceSelector display={SelectorDisplay.FilterList} />;
    case Field.Population:
      return <PopulationFilterSelector />;
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
  const primaryFilters: Field[] = getApplicableFields(TransformEnum.Filter, objectType).filter(
    (f) => f !== Field.Name, // This should not return the search bar
  );
  const otherFilters: Field[] = getApplicableFields(TransformEnum.Filter).filter(
    (f) => !primaryFilters.includes(f) && f !== Field.Name,
  );

  return (
    <>
      {primaryFilters.map((filterBy) => (
        <FilterSelector field={filterBy} key={filterBy} />
      ))}
      {otherFilters.length > 0 && (
        <details>
          <summary>Filters for related entities</summary>
          {otherFilters.map((filterBy) => (
            <FilterSelector field={filterBy} key={filterBy} />
          ))}
        </details>
      )}
    </>
  );
};

export default FilterSelector;
