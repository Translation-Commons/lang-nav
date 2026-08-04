import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import {
  getCurrencyCompactLong,
  numberToFixedUnlessSmall,
  numberToSigFigs,
} from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

const TerritoryAttributes: React.FC<{ territory: TerritoryData }> = ({ territory }) => {
  const { pop, landArea, gdp, literacyPercent } = territory;

  return (
    <DetailsSection title="Attributes">
      {pop.overall > 0 && (
        <DetailsField title="Population">
          <CountOfPeople count={pop.overall} />
        </DetailsField>
      )}
      {(pop.writing ?? 0) > 0 && (
        <DetailsField title="Population (Writing)">
          <CountOfPeople count={pop.writing} />
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
      {landArea && pop.overall && (
        <DetailsField title="Density">
          {numberToFixedUnlessSmall(pop.overall / landArea, 3)} people/km²
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default TerritoryAttributes;
