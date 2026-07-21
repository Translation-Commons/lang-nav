import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { TextInputSubmitSource } from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import SearchCombobox from './SearchCombobox';
import useSearchSuggestions from './useSearchSuggestions';
import useTrackSearch from './useTrackSearch';

const SearchBar: React.FC = () => {
  const { searchString, updatePageParams } = usePageParams();
  const location = useLocation();
  const getSearchSuggestions = useSearchSuggestions();
  const trackSearch = useTrackSearch();
  const setSearchString = useCallback(
    (value: string, source?: TextInputSubmitSource) => {
      if (location.pathname !== '/data') return;
      if (source === 'suggestion') {
        // The suggestion's link already navigates; just record the search.
        trackSearch(value, 'suggestion');
        return;
      }
      if (value === searchString) return; // skip no-op submits (e.g. blur without an edit)
      updatePageParams({ searchString: value });
      trackSearch(value, 'typed');
    },
    [updatePageParams, location.pathname, searchString, trackSearch],
  );

  return (
    <SearchCombobox
      getSuggestions={getSearchSuggestions}
      onSubmit={setSearchString}
      placeholder="search"
      value={searchString}
    />
  );
};

export default SearchBar;
