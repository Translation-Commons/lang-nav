import React from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import { getDefaultParams } from '@features/params/Profiles';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

const PopulationFilterSelector: React.FC = () => {
  const { populationMin, populationMax, updatePageParams } = usePageParams();
  const defaults = getDefaultParams();

  return (
    <SelectorDisplayProvider display={SelectorDisplay.ButtonList}>
      <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
        <SelectorLabel
          description="Filter results to show only items with population above this threshold"
          label="Min Population"
        />
        <TextInput
          inputStyle={{ minWidth: '6em' }}
          getSuggestions={async () => [
            { searchString: '0', label: '0' },
            { searchString: '100', label: '100' },
            { searchString: '1000', label: '1,000' },
            { searchString: '100000', label: '100,000' },
            { searchString: '1000000', label: '1,000,000' },
            { searchString: '-1', label: `default (0 or unknown)` },
          ]}
          onSubmit={(limitStr: string) => {
            const val = parseInt(limitStr.replace(/,/g, ''));
            updatePageParams({ populationMin: isNaN(val) ? undefined : val });
          }}
          pageParameter={PageParamKey.populationMin}
          placeholder="0 or unknown"
          value={
            populationMin !== undefined && populationMin !== defaults.populationMin
              ? populationMin.toLocaleString()
              : ''
          }
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
            { searchString: '', label: 'default (∞)' },
          ]}
          onSubmit={(limitStr: string) => {
            const val = parseInt(limitStr.replace(/,/g, ''));
            updatePageParams({ populationMax: isNaN(val) ? undefined : val });
          }}
          pageParameter={PageParamKey.populationMax}
          placeholder="∞"
          value={
            populationMax !== undefined && populationMax !== defaults.populationMax
              ? populationMax.toLocaleString()
              : ''
          }
        />
      </div>
    </SelectorDisplayProvider>
  );
};

export default PopulationFilterSelector;
