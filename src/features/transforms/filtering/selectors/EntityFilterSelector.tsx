import React, { useCallback, useMemo } from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import type { Suggestion } from '@features/params/Suggestion';
import usePageParams from '@features/params/usePageParams';
import EntitySearchCombobox from '@features/transforms/search/EntitySearchCombobox';

import EntityFilterSuggestionButtons from './EntityFilterSuggestionButtons';
import { getFilterLabelByPageParam } from './getFilterByPageParam';

type Props = {
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  pageParameter: PageParamKey;
  showButtons?: boolean;
};

const EntityFilterSelector: React.FC<Props> = ({
  getSuggestions,
  pageParameter,
  showButtons = true,
}) => {
  const params = usePageParams();

  const currentID = useMemo(() => {
    const searchString = params[pageParameter] as string;
    return getIDFromSearchString(searchString);
  }, [params[pageParameter]]);

  const onSubmit = useCallback(
    (s: Suggestion) => {
      const param = params[pageParameter] as string;
      const paramID = getIDFromSearchString(param);
      if (paramID === s.entID) params.updatePageParams({ [pageParameter]: '' });
      else params.updatePageParams({ [pageParameter]: s.ent?.nameDisplay + ' [' + s.entID + ']' });
    },
    [params.updatePageParams, params[pageParameter], pageParameter],
  );

  return (
    <div className="flex flex-col gap-1">
      {showButtons && (
        <EntityFilterSuggestionButtons
          getSuggestions={getSuggestions}
          onSubmit={onSubmit}
          currentID={currentID}
        />
      )}
      <EntitySearchCombobox
        placeholder={
          'Search by ' +
          getFilterLabelByPageParam(pageParameter, params.entType).toLowerCase() +
          ' names or code'
        }
        getSuggestions={getSuggestions}
        onSelect={onSubmit}
        pageParameter={pageParameter}
      />
    </div>
  );
};

function getIDFromSearchString(searchString: string) {
  if (searchString.includes('[') && searchString.includes(']')) {
    return searchString.split('[')[1]?.split(']')[0] ?? '';
  }
  return searchString;
}

export default EntityFilterSelector;
