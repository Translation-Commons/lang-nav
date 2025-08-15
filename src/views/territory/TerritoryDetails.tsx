import React from 'react';

import { getSortFunction } from '../../controls/sort';
import CommaSeparated from '../../generic/CommaSeparated';
import { getCurrencyCompactLong } from '../../generic/numberUtils';
import { TerritoryData } from '../../types/DataTypes';
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
        <div>
          <label>Territory ID:</label>
          {ID}
        </div>
        {!Number.isNaN(population) && (
          <div>
            <label>Population:</label>
            {population.toLocaleString()}
          </div>
        )}
        {literacyPercent && !Number.isNaN(literacyPercent) && (
          <div>
            <label>Literacy:</label>
            {literacyPercent.toFixed(1)}%
          </div>
        )}
        {gdp && !Number.isNaN(gdp) && (
          <div>
            <label>Gross Domestic Product:</label>
            {getCurrencyCompactLong(gdp)}
          </div>
        )}
      </DetailsSection>

      <DetailsSection title="Connections">
        {locales.length > 0 && (
          <div>
            <label>Languages:</label>
            <CommaSeparated>
              {Object.values(locales).map((locale) => (
                <HoverableObjectName key={locale.ID} labelSource="language" object={locale} />
              ))}
            </CommaSeparated>
          </div>
        )}

        {parentUNRegion != null && (
          <div>
            <label>In UN region:</label>
            <HoverableObjectName object={parentUNRegion} />
          </div>
        )}
        {containsTerritories.length > 0 && (
          <div>
            <label>Contains:</label>
            <CommaSeparated>
              {containsTerritories.sort(getSortFunction()).map((territory) => (
                <HoverableObjectName key={territory.ID} object={territory} />
              ))}
            </CommaSeparated>
          </div>
        )}

        {sovereign != null && (
          <div>
            <label>Administered by:</label>
            <HoverableObjectName object={sovereign} />
          </div>
        )}
        {dependentTerritories.length > 0 && (
          <div>
            <label>Administers:</label>
            <CommaSeparated>
              {dependentTerritories.sort(getSortFunction()).map((territory) => (
                <HoverableObjectName key={territory.ID} object={territory} />
              ))}
            </CommaSeparated>
          </div>
        )}

        {censuses.length > 0 && (
          <div>
            <label>Census Tables:</label>
            <CommaSeparated>
              {censuses.sort(getSortFunction()).map((census) => (
                <HoverableObjectName key={census.ID} object={census} />
              ))}
            </CommaSeparated>
          </div>
        )}
      </DetailsSection>
    </div>
  );
};
export default TerritoryDetails;
