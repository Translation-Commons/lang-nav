import React, { useCallback, useEffect, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import { useDataContext } from '@features/data/context/useDataContext';
import useHoverCard from '@features/layers/hovercard/useHoverCard';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import DrawableData from './DrawableData';

type Props = {
  drawableObjects: DrawableData[];
  coloringFunctions: ColoringFunctions;
  openCard: (obj: DrawableData, x: number, y: number) => void;
};

const MapTerritories: React.FC<Props> = ({
  drawableObjects,
  coloringFunctions: { colorBy, getColor },
  openCard,
}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { territories } = useDataContext();

  const isTerritoryInList = useCallback(
    (iso: string) => drawableObjects.some((obj) => obj.ID === iso),
    [drawableObjects],
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
        if (colorBy !== Field.None) {
          const color = getColor(territory);
          element.style.fill = color || 'var(--color-button-secondary)';
        } else {
          element.style.fill = 'var(--color-button-primary)';
        }
      } else {
        element.style.fill = '#bcbcbc';
      }

      element.style.cursor = 'pointer';
    });
  }, [territories, getColor, isTerritoryInList, colorBy, svgLoaded]);

  const buildOnMouseEnter = useCallback(
    (territory: TerritoryData, element: SVGElement) => (ev: MouseEvent) => {
      showHoverCard(
        <div>
          <strong>{territory.nameDisplay}</strong>
          <div style={{ color: 'var(--color-text-secondary)' }}>Click for more</div>
        </div>,
        ev.clientX,
        ev.clientY,
      );

      element.style.opacity = '0.7';
    },
    [showHoverCard],
  );

  const buildOnMouseLeave = useCallback(
    (element: SVGElement) => () => {
      onMouseLeaveTriggeringElement();
      element.style.opacity = '1';
    },
    [onMouseLeaveTriggeringElement],
  );

  useEffect(() => {
    if (!svgLoaded) return;

    const cleanupListeners: Array<() => void> = [];

    forEachTerritory((territory, element) => {
      const handleClick = (ev: MouseEvent) => {
        ev.stopPropagation();
        openCard(territory, ev.clientX, ev.clientY);
      };

      const handleMouseEnter = buildOnMouseEnter(territory, element);
      const handleMouseLeave = buildOnMouseLeave(element);

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
  }, [buildOnMouseEnter, buildOnMouseLeave, openCard, territories, svgLoaded]);

  return (
    <div
      ref={svgContainerRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: 'auto',
        top: 0,
        left: 0,
      }}
    >
      <SVG
        src="./data/wiki/map_countries.svg"
        preserveAspectRatio="none"
        onLoad={() => setSvgLoaded(true)}
      />
    </div>
  );
};

export default MapTerritories;
