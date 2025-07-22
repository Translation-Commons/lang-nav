import React, { useMemo } from 'react';

import { getScopeFilter, getSliceFunction, getSubstringFilter } from '../../controls/filter';
import { getSortFunction } from '../../controls/sort';
import { ObjectData } from '../../types/DataTypes';
import ViewCard from '../ViewCard';
import VisibleItemsMeter from '../VisibleItemsMeter';

interface Props<T> {
  objects: T[];
  renderCard: (object: T) => React.ReactNode;
}

function CardList<T extends ObjectData>({ objects, renderCard }: Props<T>) {
  const sortBy = getSortFunction();
  const filterBySubstring = getSubstringFilter() || (() => true);
  const filterByScope = getScopeFilter();
  const sliceFunction = getSliceFunction<T>();

  // Filter results
  const objectsVisible = useMemo(
    () => sliceFunction(objects.filter(filterByScope).filter(filterBySubstring).sort(sortBy)),
    [objects, filterByScope, filterBySubstring, sortBy, sliceFunction],
  );

  return (
    <div>
      <div className="CardListDescription">
        <VisibleItemsMeter objects={objects} />
      </div>
      <div className="CardList">
        {objectsVisible.map((object) => (
          <ViewCard key={object.ID}>{renderCard(object)}</ViewCard>
        ))}
      </div>
    </div>
  );
}

export default CardList;
