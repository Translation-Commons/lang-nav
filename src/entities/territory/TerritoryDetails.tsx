import { TerritoryData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import DetailsField from '@features/details/DetailsField';
import DetailsSection from '@features/details/DetailsSection';
import { getSortFunction } from '@features/sorting/sort';
import { getCurrencyCompactLong } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import React from 'react';

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
        {locales && locales.length > 0 && (
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
        {containsTerritories && containsTerritories.length > 0 && (
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
        {dependentTerritories && dependentTerritories.length > 0 && (
          <DetailsField title="Administers:">
            <CommaSeparated>
              {dependentTerritories.sort(getSortFunction()).map((territory) => (
                <HoverableObjectName key={territory.ID} object={territory} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {censuses && censuses.length > 0 && (
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
