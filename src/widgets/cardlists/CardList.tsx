import React, { useEffect, useMemo, useRef, useState } from 'react';

import { DetailsContainer } from '@pages/dataviews/ViewDetails';

import {
  getFilterBySubstring,
  getFilterByTerritory,
  getFilterByVitality,
  getScopeFilter,
  getSliceFunction,
} from '@features/filtering/filter';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import { getSortFunction } from '@features/sorting/sort';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ViewCard from '@shared/containers/ViewCard';

import ObjectDetails from '../details/ObjectDetails';

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
  const filterByVitality = getFilterByVitality();
  const sliceFunction = getSliceFunction<T>();

  const objectsVisible = useMemo(
    () =>
      sliceFunction(
        objects
          .filter(filterByScope)
          .filter(filterByVitality)
          .filter(filterByTerritory)
          .filter(filterBySubstring)
          .sort(sortBy),
      ),
    [
      objects,
      filterByScope,
      filterByVitality,
      filterByTerritory,
      filterBySubstring,
      sortBy,
      sliceFunction,
    ],
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
