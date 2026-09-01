import React, { useEffect, useMemo, useState } from 'react';

import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import { groupBy } from '@shared/lib/setUtils';
import {
  Combobox,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@shared/ui/combobox';

import useSearchSuggestions from './useSearchSuggestions';
import useTrackSearch from './useTrackSearch';

const SearchCombobox: React.FC = () => {
  const { entType, updatePageParams } = usePageParams();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchString, setSearchString] = useState('');
  const getSearchSuggestions = useSearchSuggestions();
  const trackSearch = useTrackSearch();

  useEffect(() => {
    let isActive = true; // Flag to track component mount status

    const fetchData = async () => {
      const suggestions = await getSearchSuggestions(searchString);
      if (isActive) setSuggestions(suggestions);
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [searchString, getSearchSuggestions]);

  const groupedItems = useMemo(
    () => groupBy(suggestions, (item) => item.group ?? ''),
    [suggestions],
  );

  return (
    <Combobox
      // items={groupedItems}
      filter={null}
      itemToStringValue={(item: Suggestion) => item.ent.nameDisplay + ' [' + item.entID + ']'}
      onValueChange={(value) => {
        if (!value) return;
        trackSearch(value.searchString + value.entID, 'suggestion');
        updatePageParams({ cmpID: value.entID });
      }}
      autoHighlight
    >
      <ComboboxInput
        placeholder={'search ' + getEntityTypeLabelPlural(entType)}
        showClear
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      <ComboboxContent>
        {/* <ComboboxEmpty>No {getEntityTypeLabelPlural(entType)} found.</ComboboxEmpty> */}
        {Object.entries(groupedItems).map(([group, items]: [string, Suggestion[]]) => (
          <ComboboxGroup key={group}>
            {group && group != 'matched' && (
              <ComboboxLabel className="px-2 py-1 text-xs font-semibold text-gray-500">
                {group}
              </ComboboxLabel>
            )}
            <ComboboxList>
              {items.map((suggestion) => (
                <ComboboxItem key={suggestion.entID} value={suggestion} className="cursor-pointer">
                  {suggestion.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxGroup>
        ))}
      </ComboboxContent>
    </Combobox>
  );
};

export default SearchCombobox;
