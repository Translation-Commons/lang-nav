import React, { useCallback } from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import EntityFilterSuggestionButtons from './EntityFilterSuggestionButtons';

type Props = {
  selectorLabel: string;
  selectorDescription?: React.ReactNode;
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  pageParameter: PageParamKey;
};

const EntityFilterSelector: React.FC<Props> = ({
  selectorLabel,
  selectorDescription,
  getSuggestions,
  pageParameter,
}) => {
  const params = usePageParams();
  const { display } = useSelectorDisplay();

  const value = params[pageParameter] as string;
  const onSubmit = useCallback(
    (value: string) => {
      if (params[pageParameter] === value) params.updatePageParams({ [pageParameter]: '' });
      else params.updatePageParams({ [pageParameter]: value });
    },
    [params.updatePageParams, params[pageParameter], pageParameter],
  );

  return (
    <div className={'selector ' + display}>
      {display !== SelectorDisplay.InlineDropdown && (
        <SelectorLabel label={selectorLabel} description={selectorDescription} />
      )}
      {display !== SelectorDisplay.InlineDropdown && (
        <EntityFilterSuggestionButtons
          getSuggestions={getSuggestions}
          onSubmit={onSubmit}
          value={value}
        />
      )}
      <div>
        <TextInput
          inputStyle={{ minWidth: '8em' }}
          placeholder="Name or code"
          getSuggestions={getSuggestions}
          onSubmit={onSubmit}
          pageParameter={pageParameter}
          value={value}
        />
      </div>
    </div>
  );
};

export default EntityFilterSelector;
