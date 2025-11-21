import React from 'react';

import TableOfLanguagesInTerritory from '@widgets/tables/TableOfLanguagesInTerritory';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { getSortFunction } from '@features/sorting/sort';

import { TerritoryData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';

import TerritoryAttributes from './sections/TerritoryAttributes';
import TerritoryLocation from './sections/TerritoryLocation';

type Props = {
  territory: TerritoryData;
};

const TerritoryDetails: React.FC<Props> = ({ territory }) => {
  const {
    censuses,
    dependentTerritories,
    locales,
    parentUNRegion,
    containsTerritories,
    sovereign,
  } = territory;

  return (
    <div className="Details">
      <TerritoryAttributes territory={territory} />

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

      <TerritoryLocation territory={territory} />
    </div>
  );
};
export default TerritoryDetails;
