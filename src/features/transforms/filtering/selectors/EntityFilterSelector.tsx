import React from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import TextInput from '@features/params/ui/TextInput';

import EntityFilterSuggestionButtons from './EntityFilterSuggestionButtons';

type Props = {
  display?: SelectorDisplay;
  selectorLabel: string;
  selectorDescription?: React.ReactNode;
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  onSubmit: (value: string) => void;
  value: string;
  pageParameter: PageParamKey;
};

const EntityFilterSelector: React.FC<Props> = ({
  display: manualDisplay,
  selectorLabel,
  selectorDescription,
  getSuggestions,
  onSubmit,
  value,
  pageParameter,
}) => {
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  return (
    <SelectorDisplayProvider display={display}>
      <div className="selector filterList" style={{ display: 'flex', flexWrap: 'wrap' }}>
        <SelectorLabel
          label={selectorLabel}
          description={selectorDescription}
        />
        <EntityFilterSuggestionButtons
          getSuggestions={getSuggestions}
          onSubmit={onSubmit}
          value={value}
        />
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

    </SelectorDisplayProvider>
  );
}

export default EntityFilterSelector;
