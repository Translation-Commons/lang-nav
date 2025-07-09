import React from 'react';
import { Search } from 'lucide-react';

import { SearchableField, View } from '../../types/PageParamTypes';
import Selector from '../components/Selector';
import SingleChoiceOptions from '../components/SingleChoiceOptions';
import TextInput from '../components/TextInput';
import { usePageParams } from '../PageParamsContext';

import { useSearchSuggestions } from './useSearchSuggestions';

const SearchBar: React.FC = () => {
  const { searchBy, searchString, updatePageParams, view } = usePageParams();
  const getSearchSuggestions = useSearchSuggestions();

  return (
    <Selector selectorLabel={<Search size="12px" />}>
      <TextInput
        inputStyle={{ minWidth: '20em' }}
        getSuggestions={getSearchSuggestions}
        onChange={(searchString: string) => updatePageParams({ searchString })}
        placeholder="search"
        showGoToDetailsButton={true}
        showTextInputButton={view !== View.Details}
        value={searchString}
      />
      <label className="NoLeftBorder">on</label>
      <SingleChoiceOptions<SearchableField>
        onChange={(searchBy: SearchableField) => updatePageParams({ searchBy })}
        options={Object.values(SearchableField)}
        selected={searchBy}
      />
    </Selector>
  );
};

export default SearchBar;
