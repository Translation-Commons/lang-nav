import React from 'react';

import { getGranularityFilter, getSliceFunction, getSubstringFilter } from '../../controls/filter';
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
  const filterByGranularity = getGranularityFilter();
  const sliceFunction = getSliceFunction<T>();

  // Filter results
  const objectsFiltered = objects.filter(filterByGranularity).filter(filterBySubstring);
  // Sort results & limit how many are visible
  const objectsVisible = sliceFunction(objectsFiltered.sort(sortBy));

  return (
    <div>
      <div className="CardListDescription">
        <VisibleItemsMeter
          nShown={objectsVisible.length}
          nFiltered={objectsFiltered.length}
          nOverall={objects.length}
        />
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
