import React from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

const PopulationFilterSelector: React.FC = () => {
  const { populationLowerLimit, populationUpperLimit, updatePageParams } = usePageParams();

  return (
    <SelectorDisplayProvider display={SelectorDisplay.ButtonList}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
          <SelectorLabel
            description="Filter results to show only items with population above this threshold"
            label="Min Population"
          />
          <TextInput
            inputStyle={{ minWidth: '6em' }}
            getSuggestions={async () => [
              { searchString: '0', label: '0' },
              { searchString: '1000', label: '1,000' },
              { searchString: '100000', label: '100,000' },
              { searchString: '1000000', label: '1,000,000' },
              { searchString: '', label: 'default' },
            ]}
            onSubmit={(limitStr: string) => {
              const val = parseInt(limitStr);
              updatePageParams({ populationLowerLimit: isNaN(val) ? undefined : val });
            }}
            pageParameter={PageParamKey.populationLowerLimit}
            placeholder="0"
            value={populationLowerLimit !== undefined ? populationLowerLimit.toString() : ''}
          />
        </div>

        <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
          <SelectorLabel
            description="Filter results to show only items with population below this threshold"
            label="Max Population"
          />
          <TextInput
            inputStyle={{ minWidth: '6em' }}
            getSuggestions={async () => [
              { searchString: '1000', label: '1,000' },
              { searchString: '100000', label: '100,000' },
              { searchString: '1000000', label: '1,000,000' },
              { searchString: '10000000', label: '10,000,000' },
              { searchString: '100000000', label: '100,000,000' },
              { searchString: '', label: 'default' },
            ]}
            onSubmit={(limitStr: string) => {
              const val = parseInt(limitStr);
              updatePageParams({ populationUpperLimit: isNaN(val) ? undefined : val });
            }}
            pageParameter={PageParamKey.populationUpperLimit}
            placeholder="∞"
            value={populationUpperLimit !== undefined ? populationUpperLimit.toString() : ''}
          />
        </div>
      </div>
    </SelectorDisplayProvider>
  );
};

export default PopulationFilterSelector;
