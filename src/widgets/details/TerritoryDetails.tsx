import React from 'react';

import TableOfLanguagesInTerritory from '@widgets/tables/TableOfLanguagesInTerritory';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import MapContainer from '@features/map/MapContainer';
import ObjectMap from '@features/map/ObjectMap';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { TerritoryData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';

import TerritoryAttributes from './sections/TerritoryAttributes';
import TerritoryIdentification from './sections/TerritoryIdentification';
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
  const sortFunction = getSortFunction();

  function getTerritoryDescendents(territory: TerritoryData): TerritoryData[] {
    const children = territory.containsTerritories ?? [];
    return [...children, ...children.flatMap((t) => getTerritoryDescendents(t))];
  }

  return (
    <div className="Details">
      <TerritoryIdentification territory={territory} />
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
              {containsTerritories.sort(sortFunction).map((territory) => (
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
              {dependentTerritories.sort(sortFunction).map((territory) => (
                <HoverableObjectName key={territory.ID} object={territory} />
              ))}
            </CommaSeparated>
          </DetailsField>
        )}

        {censuses && censuses.length > 0 && (
          <DetailsField title="Census Tables:">
            <CommaSeparated>
              {censuses.sort(sortFunction).map((census) => (
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
      <DetailsSection title="Map">
        <MapContainer>
          <ObjectMap objects={[territory, ...getTerritoryDescendents(territory)]} />
        </MapContainer>
      </DetailsSection>
    </div>
  );
};
export default TerritoryDetails;
