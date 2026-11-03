import React, { useMemo } from 'react';

import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import usePageParams from '@features/params/usePageParams';
import useColors from '@features/transforms/coloring/useColors';
import FilterBreakdown from '@features/transforms/filtering/FilterBreakdown';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import type { EntityData } from '@entities/types/EntityTypes';
import EntityCard from '@entities/ui/EntityCard';

import Deemphasized from '@shared/ui/Deemphasized';

import CardInCardList from './CardInCardList';
import CardTitle from './CardTitle';
import ResponsiveGrid from './ResponsiveGrid';

const CardList: React.FC = () => {
  const { limit } = usePageParams();
  const { filteredEntities, allEntities, isPending } = useFilteredEntities({});
  const { getCurrentEntities } = usePagination<EntityData>();
  const currentEntities = useMemo(() => {
    if (isPending) return Array(limit > 0 ? limit : 12).fill(undefined);
    return getCurrentEntities(filteredEntities);
  }, [filteredEntities, getCurrentEntities, isPending]);
  const { getColor } = useColors({ ents: filteredEntities });

  return (
    <div className="flex flex-col gap-4 text-sm">
      <VisibleItemsMeter ents={allEntities} />
      {currentEntities.length === 0 && <Deemphasized>No entities found.</Deemphasized>}

      {/* Main grid */}
      {currentEntities.length >= 1 && (
        <ResponsiveGrid>
          {currentEntities.map((ent, index) => (
            <CardInCardList key={ent?.ID ?? index} getBackgroundColor={getColor} ent={ent}>
              <div className="flex flex-col gap-2">
                <CardTitle ent={ent} />
                <EntityCard ent={ent} />
              </div>
            </CardInCardList>
          ))}
        </ResponsiveGrid>
      )}

      {/* Display another visible item meter at the bottom for convenience. */}
      {currentEntities.length > 3 && <VisibleItemsMeter ents={allEntities} />}
      {currentEntities.length === 0 && (
        <div className="w-fit mx-auto">
          <FilterBreakdown ents={allEntities} />
        </div>
      )}
    </div>
  );
};

export default CardList;
