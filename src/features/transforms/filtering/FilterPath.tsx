import { SlashIcon, XIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { SearchableField } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { LanguageScope } from '@entities/language/LanguageTypes';
import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { areArraysIdentical } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';
import EnumDropdown from '@shared/ui/EnumDropdown';
import EnumDropdownMultiSelect from '@shared/ui/EnumDropdownMultiselect';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import { useFilterLabels } from './FilterLabels';

/**
 * Shows the current active filters as a path-like breadcrumb.
 *
 * For example: ISO Vitality: Extinct / Macrolanguage or Language or Dialect / In "United States [US]" / Name contains "n"
 */
const FilterPath: React.FC = () => {
  const {
    isoStatus,
    languageFilter,
    languageScopes,
    modalityFilter,
    languageFamilyFilter,
    populationMax,
    populationMin,
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    updatePageParams,
    writingSystemFilter,
  } = usePageParams();
  const defaultParams = getDefaultParams();
  const filterLabels = useFilterLabels();

  const filters = [
    // Vitality ISO Filter
    isoStatus.length > 0 && (
      <EnumDropdownMultiSelect<LanguageISOStatus>
        value={isoStatus}
        onChange={(newValue: LanguageISOStatus[]) => updatePageParams({ isoStatus: newValue })}
        getLabel={getLanguageISOStatusLabel}
        options={Object.values(LanguageISOStatus).filter((s) => typeof s === 'number')}
      />
    ),

    // Turning off countries for language scope & modality to a different component
    !areArraysIdentical(languageScopes, defaultParams.languageScopes) && (
      <EnumDropdownMultiSelect<LanguageScope>
        value={languageScopes}
        onChange={(newValue: LanguageScope[]) => updatePageParams({ languageScopes: newValue })}
        getLabel={getLanguageScopeLabel}
        options={Object.values(LanguageScope).filter((s) => typeof s === 'number')}
        noneSelectedLabel="Any language, language family, or dialect"
      />
    ),
    modalityFilter.length > 0 && (
      <EnumDropdownMultiSelect<LanguageModality>
        value={modalityFilter}
        onChange={(newValue: LanguageModality[]) => updatePageParams({ modalityFilter: newValue })}
        getLabel={(v) => getModalityLabel(v) ?? ''}
        options={Object.values(LanguageModality).filter((s) => typeof s === 'number')}
        noneSelectedLabel="Any modality"
      />
    ),
    !areArraysIdentical(territoryScopes, defaultParams.territoryScopes) && (
      <EnumDropdownMultiSelect<TerritoryScope>
        value={territoryScopes}
        onChange={(newValue: TerritoryScope[]) => updatePageParams({ territoryScopes: newValue })}
        getLabel={getTerritoryScopeLabel}
        options={Object.values(TerritoryScope).filter((s) => typeof s === 'number')}
        noneSelectedLabel="Any territory"
      />
    ),
    territoryFilter !== '' && (
      <>
        {filterLabels.territoryFilter}
        <HoverableButton
          buttonType="reset"
          onClick={() => updatePageParams({ territoryFilter: '' })}
          style={{ padding: '0.25em' }}
          hoverContent="Clear territory filter"
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),
    writingSystemFilter !== '' && (
      <>
        {filterLabels.writingSystemFilter}
        <HoverableButton
          buttonType="reset"
          onClick={() => updatePageParams({ writingSystemFilter: '' })}
          style={{ padding: '0.25em' }}
          hoverContent="Clear writing system filter"
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),
    languageFilter !== '' && (
      <>
        {filterLabels.languageFilter}
        <HoverableButton
          buttonType="reset"
          onClick={() => updatePageParams({ languageFilter: '' })}
          style={{ padding: '0.25em' }}
          hoverContent="Clear language filter"
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),
    languageFamilyFilter !== '' && (
      <>
        {filterLabels.languageFamilyFilter}
        <HoverableButton
          buttonType="reset"
          onClick={() => updatePageParams({ languageFamilyFilter: '' })}
          style={{ padding: '0.25em' }}
          hoverContent="Clear language family filter"
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),
    searchString !== '' && (
      <>
        <EnumDropdown<SearchableField>
          options={Object.values(SearchableField)}
          value={searchBy}
          onChange={(searchBy) => updatePageParams({ searchBy })}
        />{' '}
        contains &quot;{searchString}&quot;
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear the search substring filter"
          onClick={() => updatePageParams({ searchString: '' })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    // Population Filter
    (populationMin !== defaultParams.populationMin ||
      populationMax !== defaultParams.populationMax) && (
      <>
        Population:{' '}
        {[
          populationMin !== undefined && populationMin !== defaultParams.populationMin
            ? `≥ ${populationMin.toLocaleString()}`
            : null,
          populationMax !== undefined && populationMax !== defaultParams.populationMax
            ? `≤ ${populationMax.toLocaleString()}`
            : null,
        ]
          .filter(Boolean)
          .join(' and ')}
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear population filters"
          onClick={() => updatePageParams({ populationMin: undefined, populationMax: undefined })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),
  ];

  if (filters.filter((f) => f).length === 0) {
    return <Deemphasized>No filters applied</Deemphasized>;
  }

  return (
    <span className="text-xs flex flex-wrap gap-1 items-center">
      {filters
        .filter((f) => f)
        .map((filter, i) => (
          <Fragment key={i}>
            {i !== 0 && <SlashIcon size="1em" />}
            {filter}
          </Fragment>
        ))}
    </span>
  );
};

export default FilterPath;
