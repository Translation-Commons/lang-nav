import React, { useMemo } from 'react';

import { useDataContext } from '../../data/DataContext';
import { SearchableField } from '../../types/PageParamTypes';
import { getSearchableField, HighlightedObjectField } from '../../views/common/ObjectField';
import { SelectorDisplay } from '../components/SelectorDisplay';
import SelectorLabel from '../components/SelectorLabel';
import TextInput, { Suggestion } from '../components/TextInput';
import { getScopeFilter } from '../filter';
import { usePageParams } from '../PageParamsContext';

const TerritoryFilterSelector: React.FC = () => {
  const { territoryFilter, updatePageParams } = usePageParams();
  const { territories } = useDataContext();
  const filterByScope = getScopeFilter();

  const getSuggestions = useMemo(() => {
    return async (query: string): Promise<Suggestion[]> => {
      const lowerCaseQuery = query.toLowerCase();
      return Object.values(territories)
        .filter(filterByScope)
        .filter((territory) =>
          getSearchableField(territory, SearchableField.NameOrCode)
            .toLowerCase()
            .split(/\W/g)
            .some((word) => word.startsWith(lowerCaseQuery)),
        )
        .map((object) => {
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
    };
  }, [territories, filterByScope]);

  return (
    <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
      <SelectorLabel
        display={SelectorDisplay.ButtonList}
        label="Territory Filter"
        description="Filter results by ones relevant in a territory."
      />
      <TextInput
        inputStyle={{ minWidth: '5em' }}
        display={SelectorDisplay.ButtonList}
        getSuggestions={getSuggestions}
        onChange={(territoryFilter: string) => updatePageParams({ territoryFilter })}
        placeholder="Filter name or code"
        value={territoryFilter}
      />
    </div>
  );
};

export default TerritoryFilterSelector;
