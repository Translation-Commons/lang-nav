import { ObjectData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';
import ObjectDetails from '@features/details/ObjectDetails';
import { DetailsContainer } from '@features/details/ObjectDetailsPage';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getScopeFilter,
  getSliceFunction,
} from '../filtering/filter';
import VisibleItemsMeter from '../pagination/VisibleItemsMeter';
import { getSortFunction } from '../sorting/sort';

import ViewCard from './ViewCard';

const CARD_MIN_WIDTH = 300;

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

  if (objectsVisible.length === 1) {
    return (
      <>
        <div style={{ marginBottom: '1em' }}>
          <VisibleItemsMeter objects={objects} />
        </div>
        <DetailsContainer title={<ObjectTitle object={objectsVisible[0]} />}>
          <ObjectDetails object={objectsVisible[0]} />
        </DetailsContainer>
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
