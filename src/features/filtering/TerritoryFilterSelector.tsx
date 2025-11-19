import React, { useCallback } from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@widgets/controls/components/SelectorDisplayContext';
import SelectorLabel from '@widgets/controls/components/SelectorLabel';
import TextInput, { Suggestion } from '@widgets/controls/components/TextInput';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { PageParamKey, SearchableField } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { getSearchableField, HighlightedObjectField } from '@entities/ui/ObjectField';

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
      const lowerCaseQuery = query.toLowerCase();
      const filteredTerritories = territories
        .filter((territory) =>
          getSearchableField(territory, SearchableField.NameOrCode)
            .toLowerCase()
            .split(/\W/g)
            .some((word) => word.startsWith(lowerCaseQuery)),
        )
        .sort((a, b) => (filterByScope(a) ? -1 : 1) - (filterByScope(b) ? -1 : 1));
      return filteredTerritories.map((object) => {
        const label = (
          <HighlightedObjectField
            object={object}
            field={SearchableField.NameOrCode}
            query={query}
          />
        );
        const searchString = getSearchableField(object, SearchableField.NameOrCode);
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
            onChange={(territoryFilter: string) => updatePageParams({ territoryFilter })}
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
