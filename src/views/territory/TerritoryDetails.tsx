import React from 'react';

import { getSortFunction } from '../../controls/sort';
import CommaSeparated from '../../generic/CommaSeparated';
import { getCurrencyCompactLong } from '../../generic/numberUtils';
import { TerritoryData } from '../../types/DataTypes';
import DetailsField from '../common/details/DetailsField';
import DetailsSection from '../common/details/DetailsSection';
import HoverableObjectName from '../common/HoverableObjectName';

type Props = {
  territory: TerritoryData;
};

const TerritoryDetails: React.FC<Props> = ({ territory }) => {
  const {
    ID,
    censuses,
    dependentTerritories,
    gdp,
    literacyPercent,
    locales,
    parentUNRegion,
    population,
    containsTerritories,
    sovereign,
  } = territory;

  return (
    <div className="Details">
      <DetailsSection title="Attributes">
        <DetailsField title="Territory ID:">{ID}</DetailsField>
        {!Number.isNaN(population) && (
          <DetailsField title="Population:">{population.toLocaleString()}</DetailsField>
        )}
        {literacyPercent && !Number.isNaN(literacyPercent) && (
          <DetailsField title="Literacy:">{literacyPercent.toFixed(1)}%</DetailsField>
        )}
        {gdp && !Number.isNaN(gdp) && (
          <DetailsField title="Gross Domestic Product:">{getCurrencyCompactLong(gdp)}</DetailsField>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {locales.length > 0 && (
          <DetailsField title="Languages:">
            <CommaSeparated>
              {Object.values(locales).map((locale) => (
                <HoverableObjectName key={locale.ID} labelSource="language" object={locale} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {parentUNRegion != null && (
          <DetailsField title="In UN region:">
            <HoverableObjectName object={parentUNRegion} />
          </DetailsField>
        )}
        {containsTerritories.length > 0 && (
          <DetailsField title="Contains:">
            <CommaSeparated>
              {containsTerritories.sort(getSortFunction()).map((territory) => (
                <HoverableObjectName key={territory.ID} object={territory} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {sovereign != null && (
          <DetailsField title="Administered by:">
            <HoverableObjectName object={sovereign} />
          </DetailsField>
        )}
        {dependentTerritories.length > 0 && (
          <DetailsField title="Administers:">
            <CommaSeparated>
              {dependentTerritories.sort(getSortFunction()).map((territory) => (
                <HoverableObjectName key={territory.ID} object={territory} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {censuses.length > 0 && (
          <DetailsField title="Census Tables:">
            <CommaSeparated>
              {censuses.sort(getSortFunction()).map((census) => (
                <HoverableObjectName key={census.ID} object={census} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};
export default TerritoryDetails;
