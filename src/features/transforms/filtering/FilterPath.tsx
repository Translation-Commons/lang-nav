import { SlashIcon, XIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { SearchableField } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { areArraysIdentical } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';

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

    // Turning off countries for language scope & modality to a different component
    // !areArraysIdentical(languageScopes, defaultParams.languageScopes) && (
    //   <Selector
    //     selectorStyle={{ marginLeft: '0' }}
    //     options={Object.values(LanguageScope).filter((s) => typeof s === 'number')}
    //     labelWhenEmpty="Any Languoid"
    //     onChange={(scope: LanguageScope) =>
    //       languageScopes.includes(scope)
    //         ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
    //         : updatePageParams({ languageScopes: [...languageScopes, scope] })
    //     }
    //     selected={languageScopes}
    //     getOptionLabel={getLanguageScopeLabel}
    //   />
    // ),
    // modalityFilter.length > 0 && (
    //   <Selector
    //     selectorStyle={{ marginLeft: '0' }}
    //     options={Object.values(LanguageModality).filter((v) => typeof v === 'number')}
    //     labelWhenEmpty="Any Modality"
    //     getOptionLabel={getModalityLabel}
    //     onChange={(modality: LanguageModality) =>
    //       modalityFilter.includes(modality)
    //         ? updatePageParams({
    //             modalityFilter: modalityFilter.filter((m) => m !== modality),
    //           })
    //         : updatePageParams({ modalityFilter: [...modalityFilter, modality] })
    //     }
    //     selected={modalityFilter}
    //   />
    // ),
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

  return filters
    .filter((f) => f)
    .map((filter, i) => (
      <Fragment key={i}>
        {i !== 0 && <SlashIcon size="1em" />}
        {filter}
      </Fragment>
    ));
};

export default FilterPath;
