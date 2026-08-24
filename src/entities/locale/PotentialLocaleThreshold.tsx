import { InfoIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { InputWithSuggestion } from '@shared/ui/input-with-suggestions';

const SUGGESTIONS = ['0.001', '0.005', '0.01', '0.05', '0.1', '0.5', '1', '5', '10', '0'];

export function usePotentialLocaleThreshold(
  label: ReactNode,
  description: string,
): {
  percentThreshold: number;
  percentThresholdSelector: ReactNode;
} {
  const [percentThreshold, setPercentThreshold] = React.useState(1);

  const percentThresholdSelector = (
    <>
      <div>
        {label}
        <Hoverable hoverContent={description}>
          <InfoIcon size="1em" />
        </Hoverable>
      </div>

      <InputWithSuggestion
        suggestions={SUGGESTIONS}
        value={Number.isNaN(percentThreshold) ? '' : percentThreshold.toString()}
        setValue={(val) => setPercentThreshold(Number(val))}
      />
    </>
  );

  return { percentThreshold, percentThresholdSelector };
}
