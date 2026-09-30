import React, { useCallback } from 'react';

import PopulationFilterSelector from '@features/transforms/filtering/selectors/PopulationFilterSelector';
import TerritoryFilterSelector from '@features/transforms/filtering/selectors/TerritoryFilterSelector';

import { usePotentialLocaleThreshold } from '@entities/locale/potential/PotentialLocaleThreshold';

import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

function usePotentialLocalesFilters(): {
  FilterComponent: React.ReactNode;
  isPercentEnough: (
    percInCountry: number | undefined,
    percOfLangWorldWide: number | undefined,
  ) => boolean;
} {
  const { percentThreshold: minInCountry, percentThresholdSelector: minInCountrySelector } =
    usePotentialLocaleThreshold(
      'within country:',
      'Limit results by the minimum percent population in a territory that uses the language.',
    );
  const [requireBothPercents, setRequireBothPercents] = React.useState(false);
  const {
    percentThreshold: minOfLangWorldWide,
    percentThresholdSelector: minOfLangWorldWideSelector,
  } = usePotentialLocaleThreshold(
    'of language worldwide:',
    'Limit results by the minimum percent population of the language compared worldwide.',
  );
  const isPercentEnough = useCallback(
    (percInCountry: number | undefined, percOfLangWorldWide: number | undefined) => {
      const enoughInCountry = (percInCountry ?? 0) >= minInCountry;
      const enoughOfLangWorldWide = (percOfLangWorldWide ?? 0) >= minOfLangWorldWide;
      if (requireBothPercents) return enoughInCountry && enoughOfLangWorldWide;
      return enoughInCountry || enoughOfLangWorldWide;
    },
    [minInCountry, minOfLangWorldWide, requireBothPercents],
  );

  const FilterComponent = (
    <table className="w-fit">
      <tr>
        <th>Territory</th>
        <td>
          <div className="w-fit">
            <TerritoryFilterSelector showButtons={false} />
          </div>
        </td>
      </tr>
      <tr>
        <th className="pr-2">Minimum population %</th>
        <td>
          <div className="flex flex-wrap gap-2 items-center">
            {minInCountrySelector}
            <Tabs
              value={requireBothPercents ? '1' : '0'}
              onValueChange={(value) => setRequireBothPercents(value === '1')}
            >
              <TabsList>
                <TabsTrigger value="1">and</TabsTrigger>
                <TabsTrigger value="0">or</TabsTrigger>
              </TabsList>
            </Tabs>
            {minOfLangWorldWideSelector}
          </div>
        </td>
      </tr>
      <tr>
        <th>Population count</th>
        <td>
          <div className="w-fit">
            <PopulationFilterSelector />
          </div>
        </td>
      </tr>
    </table>
  );

  return {
    FilterComponent,
    isPercentEnough,
  };
}

export default usePotentialLocalesFilters;
