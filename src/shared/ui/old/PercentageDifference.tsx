import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { cn } from '@shared/lib/utils';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { numberToFixedUnlessSmall } from '../../lib/numberUtils';

export const PercentageDifference: React.FC<{
  percentNew: number;
  percentOld?: number;
}> = ({ percentNew, percentOld }) => {
  if (percentOld == null) {
    return (
      <Deemphasized>
        <span className="text-[0.8em]">n/a</span>
      </Deemphasized>
    );
  }

  const percentagePointDifference = percentNew - percentOld;

  // Usually we can just compare regular values. However, if the percent is particularly low,
  // we still want to enable comparison. For example, if an indigenous community has 1000
  // speakers (<0.001% of the country), and this census estimates 2000 -- that's a big difference,
  // even though of the territory it is small.
  const relativeDifference = (percentagePointDifference * 100) / percentOld;
  let renderedAmount = numberToFixedUnlessSmall(percentagePointDifference) + ' pp';

  // Styling differences
  let colorClass = 'text-muted-foreground';
  let sizeClass = '';
  if (Math.abs(relativeDifference) > 10) {
    // Great difference, >10% compared to the old value
    if (percentagePointDifference > 0) {
      colorClass = 'text-blue';
      renderedAmount = '+' + renderedAmount;
    } else {
      colorClass = 'text-orange';
    }
  } else {
    sizeClass = 'text-[0.8em]';
    if (Math.abs(relativeDifference) > 1) {
      // Minor difference
      if (percentagePointDifference > 0) {
        renderedAmount = '+' + renderedAmount;
      }
    } else if (percentagePointDifference == 0) {
      // Identical values
      renderedAmount = '=';
    } else {
      // Negligible difference
      renderedAmount = '≈';
    }
  }

  return (
    <Hoverable
      hoverContent={
        <>
          <label>Old value:</label>
          {numberToFixedUnlessSmall(percentOld)}%
          <br />
          <label>New value:</label>
          {numberToFixedUnlessSmall(percentNew)}%
          <br />
          <label>Relative difference:</label>
          {relativeDifference > 0 && '+'}
          {numberToFixedUnlessSmall(relativeDifference)}%
          <br />
          <label>Percentage point difference:</label>
          {percentagePointDifference > 0 && '+'}
          {numberToFixedUnlessSmall(percentagePointDifference)} pp
          <br />
        </>
      }
    >
      <span className={cn(colorClass, sizeClass)}>{renderedAmount}</span>
    </Hoverable>
  );
};
