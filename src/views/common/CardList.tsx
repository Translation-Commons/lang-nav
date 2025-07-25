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
