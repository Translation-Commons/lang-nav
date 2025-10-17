import React from 'react';

import TableOfLanguagesInTerritory from '@widgets/tables/TableOfLanguagesInTerritory';

import { getSortFunction } from '@features/sorting/sort';

import { TerritoryData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { getCurrencyCompactLong } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

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

      {/* Languages table for the territory */}
      {locales && locales.length > 0 && (
        <DetailsSection title="Languages">
          <TableOfLanguagesInTerritory territory={territory} />
        </DetailsSection>
      )}
    </div>
  );
};
export default TerritoryDetails;
