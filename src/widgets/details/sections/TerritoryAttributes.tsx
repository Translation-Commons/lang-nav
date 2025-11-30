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
  const { ID, codeAlpha3, codeNumeric, population, landArea, gdp, literacyPercent } = territory;

  return (
    <DetailsSection title="Attributes">
      <DetailsField title="Territory ID:">{ID}</DetailsField>
      {codeAlpha3 && <DetailsField title="Alpha-3 Code:">{codeAlpha3}</DetailsField>}
      {codeNumeric && <DetailsField title="Numeric Code:">{codeNumeric}</DetailsField>}
      {!Number.isNaN(population) && (
        <DetailsField title="Population:">
          <CountOfPeople count={population} />
        </DetailsField>
      )}
      {literacyPercent && !Number.isNaN(literacyPercent) && (
        <DetailsField title="Literacy:">{literacyPercent.toFixed(1)}%</DetailsField>
      )}
      {gdp && !Number.isNaN(gdp) && (
        <DetailsField title="Gross Domestic Product:">{getCurrencyCompactLong(gdp)}</DetailsField>
      )}
      {landArea && (
        <DetailsField title="Land Area:">
          {numberToSigFigs(landArea, 3)?.toLocaleString()} km²
        </DetailsField>
      )}
      {landArea && population && (
        <DetailsField title="Density:">
          {numberToFixedUnlessSmall(population / landArea, 3)} people/km²
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default TerritoryAttributes;
