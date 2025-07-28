import React from 'react';

import { View } from '../../types/PageParamTypes';
import { OptionsDisplay } from '../components/Selector';
import SelectorLabel from '../components/SelectorLabel';
import TextInput from '../components/TextInput';
import { usePageParams } from '../PageParamsContext';

const LimitInput: React.FC = () => {
  const { limit, objectType, updatePageParams, view } = usePageParams();

  return (
    <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
      <SelectorLabel
        description={`Limit how many ${objectType.toLowerCase()} ${getLimitableObjectName(view)} are shown.`}
        label="Item Limit"
        optionsDisplay={OptionsDisplay.ButtonList}
      />
      <TextInput
        inputStyle={{ minWidth: '3em' }}
        getSuggestions={async () => [
          { searchString: '8', label: '8' },
          { searchString: '20', label: '20' },
          { searchString: '100', label: '100' },
          { searchString: '200', label: '200' },
        ]}
        onChange={(limit: string) => updatePageParams({ limit: parseInt(limit) })}
        optionsDisplay={OptionsDisplay.ButtonList}
        placeholder="∞"
        value={limit < 1 || Number.isNaN(limit) ? '' : limit.toString()}
      />
    </div>
  );
};

function getLimitableObjectName(view: View) {
  switch (view) {
    case View.CardList:
      return 'cards';
    case View.Hierarchy:
      return 'root nodes';
    case View.Details:
      return 'not applicable';
    case View.Table:
      return 'rows';
    case View.Reports:
      return 'reports';
  }
}

export default LimitInput;
