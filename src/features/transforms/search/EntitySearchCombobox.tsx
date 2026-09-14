import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Suggestion } from '@features/params/ui/SelectorSuggestions';

import { groupBy } from '@shared/lib/setUtils';
import { cn } from '@shared/lib/utils';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@shared/ui/combobox';

import useTrackSearch from './useTrackSearch';

type Props = {
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  onSelect: (value: Suggestion) => void;
  onQueryChange?: (query: string) => void;
  placeholder: string;
  ariaLabel?: string;
  emptyMessage?: string;
  className?: string;
};

const EntitySearchCombobox: React.FC<Props> = ({
  getSuggestions,
  onSelect,
  onQueryChange,
  placeholder,
  ariaLabel,
  emptyMessage,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchString, setSearchString] = useState('');
  const trackSearch = useTrackSearch();

  const onSubmit = useCallback(
    (value: Suggestion | null) => {
      if (!value) return;
      trackSearch(value.searchString + value.entID, 'suggestion');
      onSelect(value);
    },
    [trackSearch, onSelect],
  );

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      const suggestions = await getSuggestions(searchString);
      if (isActive) setSuggestions(suggestions);
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [searchString, getSuggestions]);

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
        className={cn('w-full', className)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        showClear
        value={searchString}
        onChange={(e) => {
          setSearchString(e.target.value);
          onQueryChange?.(e.target.value);
        }}
      />
      <ComboboxContent>
        {emptyMessage && suggestions.length === 0 && <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>}
        <ComboboxList>
          {Object.entries(groupedItems).map(([group, items]: [string, Suggestion[]]) => (
            <ComboboxGroup key={group}>
              {group && group != 'matched' && (
                <ComboboxLabel className="px-3 pt-2 pb-1 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
                  {group}
                </ComboboxLabel>
              )}
              {items.map((suggestion) => (
                <ComboboxItem key={suggestion.entID} value={suggestion} className="cursor-pointer">
                  <div>{suggestion.label}</div>
                  <div className="ml-auto font-mono text-xs text-muted-foreground">
                    {suggestion.entID}
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default EntitySearchCombobox;
