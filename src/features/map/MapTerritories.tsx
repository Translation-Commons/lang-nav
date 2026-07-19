import React, { useCallback, useEffect, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import { useDataContext } from '@features/data/context/useDataContext';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import DrawableData from './DrawableData';
import useMapHoverCard from './MapHoverCard';

type Props = {
  drawableEntities: DrawableData[];
  coloringFunctions: ColoringFunctions;
  onClick: (obj: DrawableData) => void;
  hoveredId?: string | null;
  pinnedIds?: string[];
};

const MapTerritories: React.FC<Props> = ({
  drawableEntities,
  coloringFunctions: { colorBy, getColor },
  onClick,
  hoveredId,
  pinnedIds = [],
}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const { showHoverCard, hideHoverCard } = useMapHoverCard();
  const { territories } = useDataContext();

  const isTerritoryInList = useCallback(
    (iso: string) => drawableEntities.some((obj) => obj.ID === iso),
    [drawableEntities],
  );

  function forEachTerritory(func: (territory: TerritoryData, element: SVGElement) => void) {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;

    territories.forEach((territory) => {
      if (territory.ID.length !== 2) return;

      const element = svg.querySelector(`#${territory.ID.toLowerCase()}`);
      if (!element || !(element instanceof SVGElement)) return;

      func(territory, element);
    });
  }

  useEffect(() => {
    if (!svgLoaded) return;

    forEachTerritory((territory, element) => {
      if (isTerritoryInList(territory.ID)) {
        element.classList.add('inList');
        if (colorBy !== Field.None) {
          const color = getColor(territory);
          element.style.fill = color || 'var(--color-button-secondary)';
        } else {
          element.style.fill = 'var(--color-button-primary)';
        }
      } else {
        element.classList.remove('inList');
        element.style.fill = '#bcbcbcbc';
      }
    });
  }, [territories, getColor, isTerritoryInList, colorBy, svgLoaded]);

  // Manage hovered and pinned states
  useEffect(() => {
    if (!svgLoaded) return;

    forEachTerritory((territory, element) => {
      element.classList.add('MapTerritory');
      element.classList.remove('hovered');
      element.classList.remove('pinned');
      if (pinnedIds.includes(territory.ID)) element.classList.add('pinned');
      if (hoveredId === territory.ID) element.classList.add('hovered');
    });
  }, [svgLoaded, hoveredId, pinnedIds]);

  const buildOnMouseEnter = useCallback(
    (territory: TerritoryData) => (ev: MouseEvent) => {
      showHoverCard(
        <div>
          <strong>{territory.nameDisplay}</strong>
          <div style={{ color: 'var(--color-text-secondary)' }}>Click for more</div>
        </div>,
        ev.clientX,
        ev.clientY,
      );
    },
    [showHoverCard],
  );

  const buildOnMouseLeave = useCallback(
    () => () => {
      hideHoverCard();
    },
    [hideHoverCard],
  );

  useEffect(() => {
    if (!svgLoaded) return;

    const cleanupListeners: Array<() => void> = [];

    forEachTerritory((territory, element) => {
      const handleClick = (ev: MouseEvent) => {
        ev.stopPropagation();
        onClick(territory);
      };

      const handleMouseEnter = buildOnMouseEnter(territory);
      const handleMouseLeave = buildOnMouseLeave();

      element.addEventListener('click', handleClick);
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      cleanupListeners.push(() => {
        element.removeEventListener('click', handleClick);
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      });
    });

    return () => cleanupListeners.forEach((cleanup) => cleanup());
  }, [buildOnMouseEnter, buildOnMouseLeave, onClick, territories, svgLoaded]);

  return (
    <div className="MapLayer" ref={svgContainerRef}>
      <SVG
        src="./data/wiki/map_countries.svg"
        preserveAspectRatio="none"
        onLoad={() => setSvgLoaded(true)}
      />
    </div>
  );
};

export default MapTerritories;
