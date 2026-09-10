import React, { useCallback } from 'react';

import { PageParams } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import EntitySearchCombobox from './EntitySearchCombobox';
import useSearchSuggestions from './useSearchSuggestions';

type Props = {
  getNewParams?: (value: Suggestion) => Partial<PageParams>;
};

const SearchCombobox: React.FC<Props> = ({ getNewParams }) => {
  const { entType, updatePageParams } = usePageParams();
  const getSearchSuggestions = useSearchSuggestions();

  const onSelect = useCallback(
    (value: Suggestion) => updatePageParams(getNewParams?.(value) ?? { cmpID: value.entID }),
    [updatePageParams, getNewParams],
  );

  return (
    <EntitySearchCombobox
      getSuggestions={getSearchSuggestions}
      onSelect={onSelect}
      placeholder={'search ' + getEntityTypeLabelPlural(entType)}
      className="min-w-[300px]"
    />
  );
};

export default SearchCombobox;
