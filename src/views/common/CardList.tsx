import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getScopeFilter,
  getSliceFunction,
} from '../../controls/filter';
import { getSortFunction } from '../../controls/sort';
import { ObjectData } from '../../types/DataTypes';
import ViewCard from '../ViewCard';
import VisibleItemsMeter from '../VisibleItemsMeter';

// When there is only one visible result we want to show the full details
// view instead of a miniature card. Import the ObjectDetails component
// from the local details folder. This component knows how to render the
// appropriate details page for each object type (language, census, etc).
import ObjectDetails from './details/ObjectDetails';

const CARD_MIN_WIDTH = 300; // Including margins

interface Props<T> {
  objects: T[];
  renderCard: (object: T) => React.ReactNode;
}

function CardList<T extends ObjectData>({ objects, renderCard }: Props<T>) {
  const sortBy = getSortFunction();
  const filterBySubstring = getFilterBySubstring();
  const filterByTerritory = getFilterByTerritory();
  const filterByScope = getScopeFilter();
  const sliceFunction = getSliceFunction<T>();

  // Filter results
  const objectsVisible = useMemo(
    () =>
      sliceFunction(
        objects
          .filter(filterByScope)
          .filter(filterByTerritory)
          .filter(filterBySubstring)
          .sort(sortBy),
      ),
    [objects, filterByScope, filterByTerritory, filterBySubstring, sortBy, sliceFunction],
  );

  // If there is exactly one visible object we should show the full details
  // view instead of a list of cards. This mirrors the behaviour of the
  // dedicated Details view and provides the user with more context about
  // the single result. We still show the VisibleItemsMeter at the top to
  // maintain context about the number of filtered objects vs total.
  if (objectsVisible.length === 1) {
    const [singleObject] = objectsVisible;
    return (
      <>
        <div style={{ marginBottom: '1em' }}>
          <VisibleItemsMeter objects={objects} />
        </div>
        <ObjectDetails object={singleObject} />
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '1em' }}>
        <VisibleItemsMeter objects={objects} />
      </div>
      <ResponsiveGrid>
        {objectsVisible.map((object) => (
          <ViewCard key={object.ID}>{renderCard(object)}</ViewCard>
        ))}
      </ResponsiveGrid>
    </>
  );
}

const ResponsiveGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect) {
        setWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nColumns = width > 0 ? Math.floor(width / CARD_MIN_WIDTH) : 1;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gridGap: '1.5em',
        gridTemplateColumns: `repeat(${nColumns}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
};

export default CardList;
