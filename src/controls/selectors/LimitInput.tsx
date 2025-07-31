import React from 'react';

import { OptionsDisplay } from '../components/Selector';
import SelectorLabel from '../components/SelectorLabel';
import TextInput from '../components/TextInput';
import { usePageParams } from '../PageParamsContext';

const LimitInput: React.FC = () => {
  const { limit, updatePageParams } = usePageParams();

  return (
    <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
      <SelectorLabel
        style={{ lineHeight: '1.25em' }}
        description={`Limit how many results are shown.`}
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

export default LimitInput;
