import React from 'react';

import ObjectMap from '@features/map/ObjectMap';

import { TerritoryData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';

const TerritoryLocation: React.FC<{ territory: TerritoryData }> = ({ territory }) => {
  return (
    <DetailsSection title="Location">
      <DetailsField title="Coordinates:">
        {territory.latitude && territory.longitude ? (
          <>
            {territory.latitude.toFixed(4)}°, {territory.longitude.toFixed(4)}°
          </>
        ) : (
          <Deemphasized>No coordinate data available.</Deemphasized>
        )}
      </DetailsField>

      {territory.latitude && territory.longitude ? (
        <>
          These coordinates show the location of the territory, usually the geographic center.
          <ObjectMap objects={[territory]} maxWidth={400} />
        </>
      ) : null}
    </DetailsSection>
  );
};

export default TerritoryLocation;
