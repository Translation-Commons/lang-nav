import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { EntityData } from '@entities/types/DataTypes';

const usePrevNextEntities = ({ ent }: { ent?: EntityData }) => {
  const { entType, view } = usePageParams();
  const location = useLocation();
  const { filteredEntities } = useFilteredEntities({});
  const index = useMemo(
    () => filteredEntities.findIndex((e) => e.ID === ent?.ID),
    [filteredEntities, ent?.ID],
  );

  // Many pages don't follow the prev/next pattern, so don't show them there.
  if (
    location.pathname !== '/data' ||
    view === View.Details ||
    view === View.Reports ||
    view === View.Hierarchy
  )
    return { prev: undefined, next: undefined };

  // Only show if the main page data matches the entity type.
  if (!ent || entType !== ent.type || index === -1) return { prev: undefined, next: undefined };

  const prev = index > 0 ? filteredEntities[index - 1] : undefined;
  const next = index < filteredEntities.length - 1 ? filteredEntities[index + 1] : undefined;

  return { prev, next };
};

export default usePrevNextEntities;
