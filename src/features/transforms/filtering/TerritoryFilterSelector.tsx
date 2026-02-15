import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import { TerritoryData } from '@entities/types/DataTypes';

import Field from '../fields/Field';
import { getSortFunctionParameterized } from '../sorting/sort';

import { getScopeFilter } from './filter';
import { getFilterLabels } from './FilterLabels';
import { getSuggestionsFunction } from './getSuggestionsFunction';

type Props = { display?: SelectorDisplay };

const TerritoryFilterSelector: React.FC<Props> = ({ display: manualDisplay }) => {
  const { territoryFilter, updatePageParams } = usePageParams();
  const { territories } = useDataContext();
  const filterByScope = getScopeFilter();
  const filterLabels = getFilterLabels();
  const sortFunction = getSortFunctionParameterized(Field.Population);
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const getSuggestions = useMemo(() => {
    const getMatchDistance = (territory: TerritoryData): number =>
      filterByScope(territory) ? 0 : 1;
    const getMatchGroup = (territory: TerritoryData): string => {
      if (!filterByScope(territory)) return 'not ' + filterLabels.territoryFilter;
      return 'matched';
    };

    return getSuggestionsFunction(territories.sort(sortFunction), getMatchDistance, getMatchGroup);
  }, [territories, filterByScope, filterLabels, sortFunction]);

  return (
    <SelectorDisplayProvider display={display}>
      <div className="selector" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <SelectorLabel
          label="In Territory"
          description="Filter results by ones relevant in a territory."
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextInput
            inputStyle={{ minWidth: '8em' }}
            getSuggestions={getSuggestions}
            onSubmit={(territoryFilter: string) => updatePageParams({ territoryFilter })}
            pageParameter={PageParamKey.territoryFilter}
            placeholder="Name or code"
            value={territoryFilter}
          />
        </div>
      </div>
    </SelectorDisplayProvider>
  );
};

export default TerritoryFilterSelector;
