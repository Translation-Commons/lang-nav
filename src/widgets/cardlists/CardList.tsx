import React, { useMemo } from 'react';

import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import useColors from '@features/transforms/coloring/useColors';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

import Deemphasized from '@shared/ui/Deemphasized';

import CardInCardList from './CardInCardList';
import ResponsiveGrid from './ResponsiveGrid';

const CardList: React.FC = () => {
  const { filteredObjects, allObjectsInType } = useFilteredObjects({});
  const { getCurrentObjects } = usePagination<ObjectData>();
  const currentObjects = useMemo(
    () => getCurrentObjects(filteredObjects),
    [filteredObjects, getCurrentObjects],
  );
  const { getColor } = useColors({ objects: filteredObjects });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <VisibleItemsMeter objects={allObjectsInType} />
      {currentObjects.length === 0 && <Deemphasized>No objects found.</Deemphasized>}

      {/* Main grid */}
      {currentObjects.length >= 1 && (
        <ResponsiveGrid>
          {currentObjects.map((object) => (
            <CardInCardList key={object.ID} getBackgroundColor={getColor} object={object}>
              <ObjectCard object={object} />
            </CardInCardList>
          ))}
        </ResponsiveGrid>
      )}

      {/* Display another visible item meter at the bottom for convenience. */}
      {currentObjects.length > 3 && <VisibleItemsMeter objects={allObjectsInType} />}
      {currentObjects.length === 0 && (
        <FilterBreakdown objects={allObjectsInType} shouldFilterUsingSearchBar={true} />
      )}
    </div>
  );
};

export default CardList;
