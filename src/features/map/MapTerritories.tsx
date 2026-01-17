import React, { useCallback, useEffect, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import { useDataContext } from '@features/data/context/useDataContext';
import useHoverCard from '@features/layers/hovercard/useHoverCard';
import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';

import { TerritoryData } from '@entities/types/DataTypes';

import DrawableData from './DrawableData';

type Props = {
  drawableObjects: DrawableData[];
  coloringFunctions: ColoringFunctions;
  getHoverContent: (obj: DrawableData) => React.ReactNode;
};

const MapTerritories: React.FC<Props> = ({
  drawableObjects,
  coloringFunctions: { colorBy, getColor },
  getHoverContent,
}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const { updatePageParams, objectType } = usePageParams();
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getTerritory, territories } = useDataContext();

  const isTerritoryInList = useCallback(
    (iso: string) => drawableObjects.some((obj) => obj.ID === iso),
    [drawableObjects],
  );

  // Iterates over all of the elements in the SVG corresponding to countries
  function forEachTerritory(func: (territory: TerritoryData, element: SVGElement) => void) {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;

    territories.forEach((territory) => {
      if (territory.ID.length !== 2) return;

      // Note: not always a group <g>, could be a path or other element
      const element = svg.querySelector(`#${territory.ID.toLowerCase()}`);
      if (!element || !(element instanceof SVGElement)) return;
      func(territory, element);
    });
  }

  // Color territories once the SVG is in the DOM
  useEffect(() => {
    if (!svgLoaded) return;

    forEachTerritory((territory, element) => {
      if (isTerritoryInList(territory.ID)) {
        if (colorBy !== 'None') {
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

  // Add hover and click handlers to country elements
  const buildOnMouseEnter = useCallback(
    (iso: string, element: SVGElement) => (ev: MouseEvent) => {
      const territory = getTerritory(iso);
      if (territory) showHoverCard(getHoverContent(territory), ev.clientX, ev.clientY);
      element.style.opacity = '0.7';
    },
    [showHoverCard, getTerritory, getHoverContent],
  );
  const buildOnMouseLeave = useCallback(
    (element: SVGElement) => () => {
      onMouseLeaveTriggeringElement();
      element.style.opacity = '1';
    },
    [onMouseLeaveTriggeringElement],
  );
  const buildOnClick = useCallback(
    (iso: string) => () => {
      if (objectType === ObjectType.Census) {
        updatePageParams({ territoryFilter: iso, view: View.Table });
      } else if (objectType === ObjectType.WritingSystem) {
        updatePageParams({ territoryFilter: iso, view: View.Table });
      } else {
        updatePageParams({ objectID: iso });
      }
    },
    [updatePageParams, objectType],
  );
  // Add hover and click handlers with cleanup
  useEffect(() => {
    if (!svgLoaded) return;

    const cleanupListeners: Array<() => void> = [];

    forEachTerritory((territory, element) => {
      const handleClick = buildOnClick(territory.ID);
      const handleMouseEnter = buildOnMouseEnter(territory.ID, element);
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
  }, [buildOnClick, buildOnMouseEnter, buildOnMouseLeave, territories, svgLoaded]);

  return (
    <div
      ref={svgContainerRef}
      style={{ position: 'absolute', width: '100%', height: 'auto', top: 0, left: 0 }}
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
