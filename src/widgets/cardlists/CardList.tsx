import React, { useMemo } from 'react';

import { DetailsContainer } from '@pages/dataviews/ViewDetails';

import useFilteredObjects from '@features/filtering/useFilteredObjects';
import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ViewCard from '@shared/containers/ViewCard';
import Deemphasized from '@shared/ui/Deemphasized';

import ObjectDetails from '../details/ObjectDetails';

import ResponsiveGrid from './ResponsiveGrid';

const CardList: React.FC = () => {
  const { filteredObjects } = useFilteredObjects({});
  const { getCurrentObjects } = usePagination<ObjectData>();
  const currentObjects = useMemo(
    () => getCurrentObjects(filteredObjects),
    [filteredObjects, getCurrentObjects],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <VisibleItemsMeter objects={filteredObjects} />
      {currentObjects.length === 0 && <Deemphasized>No objects found.</Deemphasized>}
      {currentObjects.length === 1 && (
        <DetailsContainer title={<ObjectTitle object={currentObjects[0]} />}>
          <ObjectDetails object={currentObjects[0]} />
        </DetailsContainer>
      )}
      {currentObjects.length > 1 && (
        <>
          <ResponsiveGrid>
            {currentObjects.map((object) => (
              <ViewCard key={object.ID}>
                <ObjectCard object={object} />
              </ViewCard>
            ))}
          </ResponsiveGrid>

          {/* Display another visible item meter at the bottom for convenience. */}
          <VisibleItemsMeter objects={filteredObjects} />
        </>
      )}
    </div>
  );
};

export default CardList;
