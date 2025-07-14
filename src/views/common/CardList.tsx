import React from 'react';

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

  // Filter results);
  const objectsFiltered = objects.filter(filterByScope).filter(filterBySubstring);
  const objectsOutOfScope = objects.filter((object) => !filterByScope(object));
  const objectsNotMatchingSubstring = objects
    .filter(filterByScope)
    .filter((object) => !filterBySubstring(object));
  // Sort results & limit how many are visible
  const objectsVisible = sliceFunction(objectsFiltered.sort(sortBy));

  return (
    <div>
      <div className="CardListDescription">
        <VisibleItemsMeter
          filterReason={
            <>
              {objectsOutOfScope.length > 0 && (
                <div>Out of scope: {objectsOutOfScope.length.toLocaleString()}</div>
              )}
              {objectsNotMatchingSubstring.length > 0 && (
                <div>
                  Not matching substring: {objectsNotMatchingSubstring.length.toLocaleString()}
                </div>
              )}
            </>
          }
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
