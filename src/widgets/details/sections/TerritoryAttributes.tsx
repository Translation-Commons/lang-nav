import React from 'react';

import { TerritoryData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import {
  getCurrencyCompactLong,
  numberToFixedUnlessSmall,
  numberToSigFigs,
} from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

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
