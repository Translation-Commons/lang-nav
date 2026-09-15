import React, { useCallback } from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/Suggestion';
import usePageParams from '@features/params/usePageParams';
import EntitySearchCombobox from '@features/transforms/search/EntitySearchCombobox';

import EntityFilterSuggestionButtons from './EntityFilterSuggestionButtons';

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

  const currentID = params[pageParameter] as string;
  const onSubmit = useCallback(
    (s: Suggestion) => {
      if (params[pageParameter] === s.entID) params.updatePageParams({ [pageParameter]: '' });
      else params.updatePageParams({ [pageParameter]: s.entID });
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
        placeholder="Name or code"
        getSuggestions={getSuggestions}
        onSelect={onSubmit}
        pageParameter={pageParameter}
      />
    </div>
  );
};

export default EntityFilterSelector;
