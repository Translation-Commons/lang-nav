import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';

import { useDataContext } from '@features/data/context/useDataContext';
import useHoverCard from '@features/layers/hovercard/useHoverCard';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getColorGradientFunction } from '@features/transforms/coloring/getColorGradientFunction';
import { ColoringFunctions } from '@features/transforms/coloring/useColors';
import Field from '@features/transforms/fields/Field';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { groupBy } from '@shared/lib/setUtils';

import DrawableData from './DrawableData';
import MapHoverCard from './MapHoverCard';

type Props = {
  drawableEntities: DrawableData[];
  coloringFunctions: ColoringFunctions;
  onClick: (ent: DrawableData) => void;
  hoveredId?: string | null;
  pinnedIds?: string[];
  allowSidebar: boolean;
};

const MapTerritories: React.FC<Props> = ({
  drawableEntities,
  coloringFunctions: { colorBy, getColor, minValue },
  onClick,
  hoveredId,
  pinnedIds = [],
  allowSidebar,
}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { territories } = useDataContext();
  const { entType, colorGradient } = usePageParams();
  const applyColorGradient = getColorGradientFunction(colorGradient);
  const noDataColor = entType == EntityType.Locale ? applyColorGradient(minValue) : '#bcbcbcbc';

  const territoriesToColoringEntities = useMemo(
    () =>
      groupBy(drawableEntities, (ent) =>
        ent.type === EntityType.Locale && ent.territory ? ent.territory.ID : ent.ID,
      ),
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
      const coloringEnt = territoriesToColoringEntities[territory.ID]?.[0];
      if (coloringEnt != null) {
        element.classList.add('inList');
        if (colorBy !== Field.None) {
          const color = getColor(coloringEnt);
          element.style.fill = color || 'var(--color-button-secondary)';
        } else {
          element.style.fill = 'var(--color-button-primary)';
        }
      } else {
        element.classList.remove('inList');
        element.style.fill = noDataColor;
        element.style.fillOpacity = '.8';
      }
    });
  }, [territories, getColor, territoriesToColoringEntities, colorBy, svgLoaded, noDataColor]);

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
      const interactiveEnt = territoriesToColoringEntities[territory.ID]?.[0];
      showHoverCard(
        <MapHoverCard
          ent={interactiveEnt ?? territory}
          allowSidebar={allowSidebar}
          showData={entType !== EntityType.Locale || interactiveEnt != null}
        />,
        ev.clientX,
        ev.clientY,
      );
    },
    [showHoverCard, territoriesToColoringEntities],
  );

  const buildOnMouseLeave = useCallback(
    () => () => {
      onMouseLeaveTriggeringElement();
    },
    [onMouseLeaveTriggeringElement],
  );

  useEffect(() => {
    if (!svgLoaded) return;

    const cleanupListeners: Array<() => void> = [];

    forEachTerritory((territory, element) => {
      const interactiveEnt = territoriesToColoringEntities[territory.ID]?.[0] ?? territory;
      const handleClick = (ev: MouseEvent) => {
        ev.stopPropagation();
        onClick(interactiveEnt);
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
  }, [
    buildOnMouseEnter,
    buildOnMouseLeave,
    onClick,
    territories,
    svgLoaded,
    territoriesToColoringEntities,
  ]);

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
