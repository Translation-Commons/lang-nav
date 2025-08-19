import { SlashIcon, XIcon } from 'lucide-react';
import React, { Fragment } from 'react';

import Deemphasized from '../../generic/Deemphasized';
import HoverableButton from '../../generic/HoverableButton';
import { areArraysIdentical } from '../../generic/setUtils';
import { TerritoryScope } from '../../types/DataTypes';
import { LanguageScope } from '../../types/LanguageTypes';
import { SearchableField, View } from '../../types/PageParamTypes';
import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';
import { usePageParams } from '../PageParamsContext';
import { getDefaultParams } from '../Profiles';

const FilterPath: React.FC = () => {
  const {
    languageScopes,
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    updatePageParams,
    view,
  } = usePageParams();
  const defaultParams = getDefaultParams();

  const filters = [
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
