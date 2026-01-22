import React from 'react';

import MapContainer from '@features/map/MapContainer';
import ObjectMap from '@features/map/ObjectMap';

import { TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const TerritoryLocation: React.FC<{ territory: TerritoryData }> = ({ territory }) => {
  return (
    <DetailsSection title="Location">
      <DetailsField title="Center">
        {territory.latitude && territory.longitude ? (
          <>
            {territory.latitude.toFixed(4)}°, {territory.longitude.toFixed(4)}°
          </>
        ) : (
          <Deemphasized>No coordinate data available.</Deemphasized>
        )}
      </DetailsField>

      <DetailsField title="Map">Showing {getMapLabel(territory)}</DetailsField>
      <MapContainer>
        <ObjectMap
          objects={[
            territory,
            ...getTerritoryDescendents(territory, territory.scope === TerritoryScope.Country),
          ]}
        />
      </MapContainer>
    </DetailsSection>
  );
};

function getMapLabel(territory: TerritoryData): React.ReactNode {
  switch (territory.scope) {
    case TerritoryScope.Country:
      if (territory.dependentTerritories && territory.dependentTerritories.length > 0) {
        return 'this country and its dependent territories';
      }
      return 'this country';
    case TerritoryScope.Dependency:
      return 'this territory';
    case TerritoryScope.Continent:
    case TerritoryScope.Region:
    case TerritoryScope.Subcontinent:
      return (
        <>
          all of the territories in this {territory.scope.toLowerCase()} (according to
          <LinkButton href="https://unstats.un.org/unsd/methodology/m49/">
            the UN methodology
          </LinkButton>
          ).
        </>
      );
    case TerritoryScope.World:
      return 'the world';
    default:
      return 'territory';
  }
}

function getTerritoryDescendents(
  territory: TerritoryData,
  includeDependencies: boolean,
): TerritoryData[] {
  const children = territory.containsTerritories ?? [];
  if (includeDependencies) {
    const dependencies = territory.dependentTerritories ?? [];
    children.push(...dependencies);
  }
  return [...children, ...children.flatMap((t) => getTerritoryDescendents(t, includeDependencies))];
}

export default TerritoryLocation;
