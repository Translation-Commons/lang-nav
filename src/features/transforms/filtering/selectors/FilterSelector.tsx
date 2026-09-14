import React from 'react';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import LanguageSourceSelector from '@features/transforms/filtering/selectors/LanguageSourceSelector';
import SearchCombobox from '@features/transforms/search/SearchCombobox';
import TransformEnum from '@features/transforms/TransformEnum';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import EnumButtonsMultiSelect from '@shared/ui/EnumButtonsMultiSelect';
import { Separator } from '@shared/ui/separator';

import { getFieldLabel } from '@strings/FieldLabelStrings';
import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LanguageFamilyFilterSelector from './LanguageFamilyFilterSelector';
import LanguageFilterSelector from './LanguageFilterSelector';
import PopulationFilterSelector from './PopulationFilterSelector';
import TerritoryFilterSelector from './TerritoryFilterSelector';
import WritingSystemFilterSelector from './WritingSystemFilterSelector';

type Props = { field: Field };

const FilterSelector: React.FC<Props> = ({ field }) => {
  switch (field) {
    case Field.Language:
      return <LanguageFilterSelector />;
    case Field.LanguageFamily:
      return <LanguageFamilyFilterSelector />;
    case Field.Territory:
      return <TerritoryFilterSelector />;
    case Field.WritingSystem:
      return <WritingSystemFilterSelector />;
    case Field.Modality:
      return (
        <EnumButtonsMultiSelect
          paramKey="modalityFilter"
          options={Object.values(LanguageModality).filter((v) => typeof v === 'number')}
          getLabel={(o) => getModalityLabel(o) ?? ''}
        />
      );
    case Field.LanguageScope:
      return (
        <EnumButtonsMultiSelect
          paramKey="languageScopes"
          options={Object.values(LanguageScope).filter((v) => typeof v === 'number')}
          getLabel={(o) => getLanguageScopeLabel(o) ?? ''}
        />
      );
    case Field.TerritoryScope:
      return (
        <EnumButtonsMultiSelect
          paramKey="territoryScopes"
          options={Object.values(TerritoryScope).filter((v) => typeof v === 'number')}
          getLabel={(o) => getTerritoryScopeLabel(o) ?? ''}
        />
      );
    case Field.ISOStatus:
      return (
        <EnumButtonsMultiSelect
          paramKey="isoStatus"
          options={Object.values(LanguageISOStatus).filter((v) => typeof v === 'number')}
          getLabel={(o) => getLanguageISOStatusLabel(o) ?? ''}
        />
      );
    case Field.Name:
      return <SearchCombobox />; // Technically correct but not recommended usage
    case Field.SourceForLanguage:
      return <LanguageSourceSelector />;
    case Field.Population:
      return <PopulationFilterSelector />;
    default:
      return null;
  }
};

/**
 * Limits filters by the ones applicable to the current entity type. For example, if we're
 * looking at censuses, we don't need to show filter for writing system because that does not
 * apply. Censuses would not show the filter for languages because that has not been set up yet.
 */
export const AllApplicableFilterSelectors: React.FC = () => {
  const { entType } = usePageParams();
  const primaryFilters: Field[] = getApplicableFields(TransformEnum.Filter, entType).filter(
    (f) => f !== Field.Name, // This should not return the search bar
  );
  const otherFilters: Field[] = getApplicableFields(TransformEnum.Filter).filter(
    (f) => !primaryFilters.includes(f) && f !== Field.Name,
  );

  return (
    <div>
      {primaryFilters.map((filterBy) => (
        <div key={filterBy}>
          <div>{getFieldLabel(filterBy, entType)}</div>
          <FilterSelector field={filterBy} />
          <Separator className="my-2" />
        </div>
      ))}
      {otherFilters.length > 0 && (
        <details style={{ marginTop: '0.5em', fontSize: '0.8em' }}>
          <summary>Extra filters</summary>
          Entities shown on the page may be filtered by additional criteria.
          {otherFilters.map((filterBy) => (
            <FilterSelector field={filterBy} key={filterBy} />
          ))}
        </details>
      )}
    </div>
  );
};

export default FilterSelector;
