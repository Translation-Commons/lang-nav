import React from 'react';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import {
    getCurrencyCompactLong,
    numberToFixedUnlessSmall,
    numberToSigFigs,
} from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

const TerritoryAttributes: React.FC<{ territory: TerritoryData }> = ({ territory }) => {
  const { population, landArea, gdp, literacyPercent } = territory;

  return (
    <DetailsSection title="Attributes">
      {!Number.isNaN(population) && (
        <DetailsField title="Population">
          <CountOfPeople count={population} />
        </DetailsField>
      )}
      {literacyPercent && !Number.isNaN(literacyPercent) && (
        <DetailsField title="Literacy">{literacyPercent.toFixed(1)}%</DetailsField>
      )}
      {gdp && !Number.isNaN(gdp) && (
        <DetailsField title="Gross Domestic Product">{getCurrencyCompactLong(gdp)}</DetailsField>
      )}
      {landArea && (
        <DetailsField title="Land Area">
          {numberToSigFigs(landArea, 3)?.toLocaleString()} km²
        </DetailsField>
      )}
      {landArea && population && (
        <DetailsField title="Density">
          {numberToFixedUnlessSmall(population / landArea, 3)} people/km²
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default TerritoryAttributes;
