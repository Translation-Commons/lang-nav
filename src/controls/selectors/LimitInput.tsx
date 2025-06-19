import React from 'react';

import { View } from '../../types/PageParamTypes';
import Selector from '../components/Selector';
import TextInput from '../components/TextInput';
import { usePageParams } from '../PageParamsContext';

const LimitInput: React.FC = () => {
  const { limit, objectType, updatePageParams, view } = usePageParams();
  if ([View.About].includes(view)) {
    // Not supported for this view
    return <></>;
  }

  return (
    <Selector
      selectorLabel="Limit:"
      selectorDescription={`Limit how many ${objectType.toLowerCase()} ${getLimitableObjectName(view)} are shown.`}
    >
      <TextInput
        inputStyle={{ width: '3em' }}
        getSuggestions={async () => [
          { searchString: '8', label: '8' },
          { searchString: '20', label: '20' },
          { searchString: '100', label: '100' },
          { searchString: '200', label: '200' },
        ]}
        onChange={(limit: string) => updatePageParams({ limit: parseInt(limit) })}
        placeholder="∞"
        value={limit < 1 || Number.isNaN(limit) ? '' : limit.toString()}
      />
    </Selector>
  );
};

function getLimitableObjectName(view: View) {
  switch (view) {
    case View.CardList:
      return 'cards';
    case View.Hierarchy:
      return 'root nodes';
    case View.Details:
    case View.About:
      return 'not applicable';
    case View.Table:
      return 'rows';
    case View.Reports:
      return 'reports';
  }
}

export default LimitInput;
