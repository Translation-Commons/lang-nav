import { SlashIcon, XIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { SearchableField, View } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { LanguageScope } from '@entities/language/LanguageTypes';
import {
  getLanguageISOStatusLabel,
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
} from '@entities/language/vitality/VitalityStrings';
import { TerritoryScope } from '@entities/types/DataTypes';

import { areArraysIdentical } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';

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
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    updatePageParams,
    view,
    vitalityEth2013,
    vitalityEth2025,
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

    // Ethnologue 2013 Filter
    vitalityEth2013.length > 0 && (
      <>
        Ethnologue 2013: {vitalityEth2013.map(getVitalityEthnologueFineLabel).join(', ')}
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear the vitality filter based on Ethnologue 2013"
          onClick={() => updatePageParams({ vitalityEth2013: [] })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    // Ethnologue 2025 Filter
    vitalityEth2025.length > 0 && (
      <>
        Ethnologue 2025: {vitalityEth2025.map(getVitalityEthnologueCoarseLabel).join(', ')}
        <HoverableButton
          buttonType="reset"
          hoverContent="Clear the vitality filter based on Ethnologue 2025"
          onClick={() => updatePageParams({ vitalityEth2025: [] })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    !areArraysIdentical(languageScopes, defaultParams.languageScopes) && (
      <Selector
        selectorStyle={{ marginLeft: '0' }}
        options={Object.values(LanguageScope)}
        labelWhenEmpty="Any Languoid"
        onChange={(scope: LanguageScope) =>
          languageScopes.includes(scope)
            ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
            : updatePageParams({ languageScopes: [...languageScopes, scope] })
        }
        selected={languageScopes}
      />
    ),
    !areArraysIdentical(territoryScopes, defaultParams.territoryScopes) && (
      <Selector
        selectorStyle={{ marginLeft: '0' }}
        options={Object.values(TerritoryScope)}
        labelWhenEmpty="Any Geography"
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

  if (view === View.Details) {
    return <></>;
  }
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
