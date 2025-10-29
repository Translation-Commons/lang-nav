import { SlashIcon, XIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import Selector from '@widgets/controls/components/Selector';
import { SelectorDisplay } from '@widgets/controls/components/SelectorDisplay';

import HoverableButton from '@features/hovercard/HoverableButton';
import { SearchableField, View } from '@features/page-params/PageParamTypes';
import { getDefaultParams } from '@features/page-params/Profiles';
import usePageParams from '@features/page-params/usePageParams';

import { LanguageScope } from '@entities/language/LanguageTypes';
import {
  getVitalityISOLabel,
  getVitalityEthnologueFineLabel,
  getVitalityEthnologueCoarseLabel,
} from '@entities/language/vitality/VitalityStrings';
import { TerritoryScope } from '@entities/types/DataTypes';

import { areArraysIdentical } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';

const FilterPath: React.FC = () => {
  const {
    languageScopes,
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    vitalityISO,
    vitalityEth2013,
    vitalityEth2025,
    updatePageParams,
    view,
  } = usePageParams();
  const defaultParams = getDefaultParams();

  const filters = [
    // Vitality ISO Filter
    vitalityISO.length > 0 && (
      <>
        ISO Vitality: {vitalityISO.map(getVitalityISOLabel).join(', ')}
        <HoverableButton
          buttonType="reset"
          onClick={() => updatePageParams({ vitalityISO: [] })}
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
          onClick={() => updatePageParams({ vitalityEth2025: [] })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),

    languageScopes.length > 0 &&
      !areArraysIdentical(languageScopes, defaultParams.languageScopes) && (
        <Selector
          selectorStyle={{ marginLeft: '0' }}
          options={Object.values(LanguageScope)}
          display={SelectorDisplay.InlineDropdown}
          onChange={(scope: LanguageScope) =>
            languageScopes.includes(scope)
              ? updatePageParams({ languageScopes: languageScopes.filter((s) => s != scope) })
              : updatePageParams({ languageScopes: [...languageScopes, scope] })
          }
          selected={languageScopes}
        />
      ),
    territoryScopes.length > 0 &&
      !areArraysIdentical(territoryScopes, defaultParams.territoryScopes) && (
        <Selector
          selectorStyle={{ marginLeft: '0' }}
          options={Object.values(TerritoryScope)}
          display={SelectorDisplay.InlineDropdown}
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
        In &quot;{territoryFilter}&quot;
        <HoverableButton
          buttonType="reset"
          onClick={() => updatePageParams({ territoryFilter: '' })}
          style={{ padding: '0.25em' }}
        >
          <XIcon size="1em" display="block" />
        </HoverableButton>
      </>
    ),
    searchString !== '' && (
      <>
        <Selector
          options={Object.values(SearchableField)}
          display={SelectorDisplay.InlineDropdown}
          onChange={(searchBy) => updatePageParams({ searchBy })}
          selected={searchBy}
        />{' '}
        contains &quot;{searchString}&quot;
        <HoverableButton
          buttonType="reset"
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
