import React, { useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey, SearchableField } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import getSubstringFilterOnQuery from '../search/getSubstringFilterOnQuery';
import HighlightedObjectField from '../search/HighlightedObjectField';

import { getScopeFilter } from './filter';

type Props = { display?: SelectorDisplay };

const TerritoryFilterSelector: React.FC<Props> = ({ display: manualDisplay }) => {
  const { territoryFilter, updatePageParams } = usePageParams();
  const { territories } = useDataContext();
  const filterByScope = getScopeFilter();
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const getSuggestions = useCallback(
    async (query: string): Promise<Suggestion[]> => {
      const trimmedQuery = query.split('[')[0].trim();
      const filterFunction = getSubstringFilterOnQuery(trimmedQuery, SearchableField.CodeOrNameAny);
      const filteredTerritories = territories
        .filter(filterFunction)
        .sort((a, b) => (filterByScope(a) ? -1 : 1) - (filterByScope(b) ? -1 : 1));
      return filteredTerritories.map((object) => {
        const label = (
          <HighlightedObjectField
            object={object}
            field={SearchableField.CodeOrNameAny}
            query={trimmedQuery}
            showOriginalName={true}
          />
        );
        const searchString = object.nameDisplay + ' [' + object.ID + ']';
        return { objectID: object.ID, searchString, label };
      });
    },
    [territories, filterByScope],
  );

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
