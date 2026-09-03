import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { PageParams } from '@features/params/PageParamTypes';
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

type Props = {
  getNewParams?: (value: Suggestion) => Partial<PageParams>;
};

const SearchCombobox: React.FC<Props> = ({ getNewParams }) => {
  const { entType, updatePageParams } = usePageParams();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchString, setSearchString] = useState('');
  const getSearchSuggestions = useSearchSuggestions();
  const trackSearch = useTrackSearch();

  const onSubmit = useCallback(
    (value: Suggestion | null) => {
      if (!value) return;
      trackSearch(value.searchString + value.entID, 'suggestion');
      updatePageParams(getNewParams?.(value) ?? { cmpID: value.entID });
    },
    [trackSearch, updatePageParams, getNewParams],
  );

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
      filter={null}
      itemToStringValue={(item: Suggestion) =>
        (item.ent?.nameDisplay ?? '') + ' [' + item.entID + ']'
      }
      onValueChange={onSubmit}
      autoHighlight
    >
      <ComboboxInput
        className="min-w-[300px] text-(--foreground)! bg-(--background)! mx-auto"
        placeholder={'search ' + getEntityTypeLabelPlural(entType)}
        showClear
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      <ComboboxContent>
        <ComboboxList>
          {Object.entries(groupedItems).map(([group, items]: [string, Suggestion[]]) => (
            <ComboboxGroup key={group}>
              {group && group != 'matched' && (
                <ComboboxLabel className="px-2 py-1 text-xs font-semibold text-gray-500">
                  {group}
                </ComboboxLabel>
              )}
              {items.map((suggestion) => (
                <ComboboxItem
                  key={suggestion.entID}
                  value={suggestion}
                  className="cursor-pointer justify-between"
                >
                  <div>{suggestion.label}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{suggestion.entID}</div>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default SearchCombobox;
