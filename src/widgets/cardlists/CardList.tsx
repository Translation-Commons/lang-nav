import React, { useMemo } from 'react';

import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import useColors from '@features/transforms/coloring/useColors';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { EntityData } from '@entities/types/DataTypes';
import EntityCard from '@entities/ui/EntityCard';

import Deemphasized from '@shared/ui/Deemphasized';

import CardInCardList from './CardInCardList';
import ResponsiveGrid from './ResponsiveGrid';

const CardList: React.FC = () => {
  const { filteredEntities, allEntities } = useFilteredEntities({});
  const { getCurrentEntities } = usePagination<EntityData>();
  const currentEntities = useMemo(
    () => getCurrentEntities(filteredEntities),
    [filteredEntities, getCurrentEntities],
  );
  const { getColor } = useColors({ ents: filteredEntities });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <VisibleItemsMeter ents={allEntities} />
      {currentEntities.length === 0 && <Deemphasized>No entities found.</Deemphasized>}

      {/* Main grid */}
      {currentEntities.length >= 1 && (
        <ResponsiveGrid>
          {currentEntities.map((ent) => (
            <CardInCardList key={ent.ID} getBackgroundColor={getColor} ent={ent}>
              <EntityCard ent={ent} />
            </CardInCardList>
          ))}
        </ResponsiveGrid>
      )}

      {/* Display another visible item meter at the bottom for convenience. */}
      {currentEntities.length > 3 && <VisibleItemsMeter ents={allEntities} />}
      {currentEntities.length === 0 && (
        <FilterBreakdown ents={allEntities} shouldFilterUsingSearchBar={true} />
      )}
    </div>
  );
};

export default CardList;
