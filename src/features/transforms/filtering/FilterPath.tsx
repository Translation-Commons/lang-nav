import { SlashIcon, XIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { SearchableField } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';
import { LanguageScope } from '@entities/language/LanguageTypes';
import {
  getLanguageISOStatusLabel,
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
} from '@entities/language/vitality/VitalityStrings';
import { TerritoryScope } from '@entities/types/DataTypes';

import { areArraysIdentical } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import { getFilterLabels } from './FilterLabels';

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
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    updatePageParams,
    vitalityEthFine,
    vitalityEthCoarse,
    writingSystemFilter,
  } = usePageParams();
  const defaultParams = getDefaultParams();
  const filterLabels = getFilterLabels();

  const filters = [
    // Vitality ISO Filter
    isoStatus.length > 0 && (
      <>
        ISO Status: {isoStatus.map(getLanguageISOStatusLabel).join(', ')}
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear the vitality filter based on ISO"
          onClick={() => updatePageParams({ isoStatus: [] })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    // Ethnologue Fine Filter
    vitalityEthFine.length > 0 && (
      <>
        Ethnologue Fine: {vitalityEthFine.map(getVitalityEthnologueFineLabel).join(', ')}
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear the vitality filter based on Ethnologue Fine"
          onClick={() => updatePageParams({ vitalityEthFine: [] })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    // Ethnologue Coarse Filter
    vitalityEthCoarse.length > 0 && (
      <>
        Ethnologue Coarse: {vitalityEthCoarse.map(getVitalityEthnologueCoarseLabel).join(', ')}
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear the vitality filter based on Ethnologue Coarse"
          onClick={() => updatePageParams({ vitalityEthCoarse: [] })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    !areArraysIdentical(languageScopes, defaultParams.languageScopes) && (
      <Selector
        selectorStyle={{ marginLeft: '0' }}
        options={Object.values(LanguageScope).filter((s) => typeof s === 'number')}
        labelWhenEmpty="Any Languoid"
        onChange={(scope: LanguageScope) =>
          languageScopes.includes(scope)
            ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
            : updatePageParams({ languageScopes: [...languageScopes, scope] })
        }
        selected={languageScopes}
        getOptionLabel={getLanguageScopeLabel}
      />
    ),
    modalityFilter.length > 0 && (
      <Selector
        selectorStyle={{ marginLeft: '0' }}
        options={Object.values(LanguageModality).filter((v) => typeof v === 'number')}
        labelWhenEmpty="Any Modality"
        getOptionLabel={getModalityLabel}
        onChange={(modality: LanguageModality) =>
          modalityFilter.includes(modality)
            ? updatePageParams({
                modalityFilter: modalityFilter.filter((m) => m !== modality),
              })
            : updatePageParams({ modalityFilter: [...modalityFilter, modality] })
        }
        selected={modalityFilter}
      />
    ),
    !areArraysIdentical(territoryScopes, defaultParams.territoryScopes) && (
      <Selector
        selectorStyle={{ marginLeft: '0' }}
        options={Object.values(TerritoryScope).filter((s) => typeof s === 'number')}
        labelWhenEmpty="Any Geography"
        getOptionLabel={getTerritoryScopeLabel}
        onChange={(scope: TerritoryScope) =>
          territoryScopes.includes(scope)
            ? updatePageParams({ territoryScopes: territoryScopes.filter((s) => s != scope) })
            : updatePageParams({ territoryScopes: [...territoryScopes, scope] })
        }
        selected={territoryScopes}
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
    searchString !== '' && (
      <>
        <Selector
          options={Object.values(SearchableField)}
          onChange={(searchBy) => updatePageParams({ searchBy })}
          selected={searchBy}
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
  ];

  if (filters.filter((f) => f).length === 0) {
    return (
      <>
        <SlashIcon size="1em" />
        <Deemphasized>No filters applied</Deemphasized>
      </>
    );
  }

  return (
    <>
      <SlashIcon size="1em" />
      {filters
        .filter((f) => f)
        .map((filter, i) => (
          <Fragment key={i}>
            {i !== 0 && <SlashIcon size="1em" />}
            {filter}
          </Fragment>
        ))}
    </>
  );
};

export default FilterPath;
