import React, { useMemo } from 'react';

import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import useColors from '@features/transforms/coloring/useColors';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

import Deemphasized from '@shared/ui/old/Deemphasized';

import CardInCardList from './CardInCardList';
import ResponsiveGrid from './ResponsiveGrid';

const CardList: React.FC = () => {
  const { filteredEntities, allEntities } = useFilteredEntities({});
  const { getCurrentEntities } = usePagination<ObjectData>();
  const currentEntities = useMemo(
    () => getCurrentEntities(filteredEntities),
    [filteredEntities, getCurrentEntities],
  );
  const { getColor } = useColors({ objects: filteredEntities });

  return (
    <div className="flex flex-col gap-4">
      {currentEntities.length === 0 && <Deemphasized>No objects found.</Deemphasized>}

      {/* Main grid */}
      {currentEntities.length >= 1 && (
        <ResponsiveGrid>
          {currentEntities.map((ent) => (
            <CardInCardList key={ent.ID} getBackgroundColor={getColor} object={ent}>
              <ObjectCard object={ent} />
            </CardInCardList>
          ))}
        </ResponsiveGrid>
      )}

      {/* Pagination + result count live below the cards only. */}
      {currentEntities.length > 3 && <VisibleItemsMeter objects={allEntities} />}
      {currentEntities.length === 0 && (
        <FilterBreakdown objects={allEntities} shouldFilterUsingSearchBar={true} />
      )}
    </div>
  );
};

export default CardList;
