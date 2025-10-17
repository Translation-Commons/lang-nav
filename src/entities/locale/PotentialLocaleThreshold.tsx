import React, { ReactNode } from 'react';

import { SelectorDisplay } from '@widgets/controls/components/SelectorDisplay';
import SelectorLabel from '@widgets/controls/components/SelectorLabel';
import TextInput from '@widgets/controls/components/TextInput';

export function usePotentialLocaleThreshold(): {
  percentThreshold: number;
  percentThresholdSelector: ReactNode;
} {
  const [percentThreshold, setPercentThreshold] = React.useState(0.05);

  const percentThresholdSelector = (
    <div className="selector" style={{ display: 'flex', alignItems: 'end', marginBottom: '0.5em' }}>
      <SelectorLabel
        display={SelectorDisplay.ButtonGroup}
        label="Percent Threshold:"
        description={`Limit results by the minimum percent population in a territory that uses the language.`}
      />
      <TextInput
        inputStyle={{ width: '3em', borderRadius: '1em 0 0 1em' }}
        getSuggestions={async () => [
          { searchString: '0.001', label: '0.001%' },
          { searchString: '0.005', label: '0.005%' },
          { searchString: '0.01', label: '0.01%' },
          { searchString: '0.05', label: '0.05%' },
          { searchString: '0.1', label: '0.1%' },
          { searchString: '0.5', label: '0.5%' },
          { searchString: '1', label: '1%' },
          { searchString: '5', label: '5%' },
          { searchString: '10', label: '10%' },
        ]}
        display={SelectorDisplay.ButtonGroup}
        onChange={(percent: string) => setPercentThreshold(Number(percent))}
        placeholder=""
        value={Number.isNaN(percentThreshold) ? '' : percentThreshold.toString()}
      />
    </div>
  );

  return { percentThreshold, percentThresholdSelector };
}
