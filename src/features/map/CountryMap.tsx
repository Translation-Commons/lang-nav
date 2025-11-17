import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import SVG from 'react-inlinesvg';

import { useDataContext } from '@features/data/context/useDataContext';
import useHoverCard from '@features/hovercard/useHoverCard';
import useColors from '@features/transforms/coloring/useColors';

import { ObjectData, TerritoryScope } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

type Props = {
  objects: ObjectData[];
};

const CountryMap: React.FC<Props> = ({ objects }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const { getTerritory, territories } = useDataContext();
  const { getColor, colorBy } = useColors({ objects });

  const isFilteringCountries = useMemo(() => {
    const countryIDs = territories
      .filter(
        (t) =>
          t.scope === TerritoryScope.Country ||
          t.scope === TerritoryScope.Dependency ||
          t.ID === 'AQ',
      )
      .map((t) => t.ID);
    const objectIDs = new Set(objects.map((t) => t.ID));
    return countryIDs.some((id) => !objectIDs.has(id));
  }, [objects, territories]);

  const isTerritoryInList = useCallback(
    (iso: string) => {
      return objects.some((obj) => obj.type === 'Territory' && obj.ID === iso);
    },
    [objects],
  );

  const buildOnMouseEnter = useCallback(
    (iso: string, g: SVGElement) => (ev: MouseEvent) => {
      const obj = getTerritory(iso);
      if (obj) showHoverCard(<ObjectCard object={obj} />, ev.clientX, ev.clientY);
      g.style.opacity = '0.7';
    },
    [showHoverCard, getTerritory],
  );
  const buildOnMouseLeave = useCallback(
    (g: SVGElement) => () => {
      onMouseLeaveTriggeringElement();
      g.style.opacity = '1';
    },
    [onMouseLeaveTriggeringElement],
  );

  // Color countries
  useEffect(() => {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;

    territories.forEach((territory) => {
      if (territory.ID.length !== 2) return;

      const g = svg.querySelector(`#${territory.ID.toLowerCase()}`);
      if (!g || !(g instanceof SVGElement)) return;

      if (isTerritoryInList(territory.ID)) {
        if (colorBy !== 'None') {
          const color = getColor(territory);
          g.style.fill = color || 'var(--color-button-secondary)';
        } else {
          if (isFilteringCountries) {
            g.style.fill = 'var(--color-button-primary)';
          } else {
            g.style.fill = 'var(--color-button-secondary)';
          }
        }
      } else {
        g.style.fill = '#bcbcbc';
      }
    });
  }, [territories, getColor, isFilteringCountries, isTerritoryInList, colorBy]);

  return (
    <div
      ref={svgContainerRef}
      style={{ position: 'absolute', width: '100%', height: 'auto', top: 0, left: 0 }}
    >
      <SVG
        src="./data/wiki/map_countries.svg"
        // width="100%"
        // height="100%"
        // height="fit-container"
        // viewBox="-180 -90 360 180"
        // style={{ width: '91.5%', transform: 'translate(-0.12%, -1.35%)', height: '99.5%' }}
        preserveAspectRatio="none"
        onLoad={() => {
          const svg = svgContainerRef.current?.querySelector('svg');
          if (!svg) return;

          // Add hover events to all territories
          territories.forEach((territory) => {
            if (territory.ID.length !== 2) return;

            // Note: not always a group (g), could be a path or other element
            const g = svg.querySelector(`#${territory.ID.toLowerCase()}`);
            if (!g || !(g instanceof SVGElement)) return;

            g.addEventListener('mouseenter', buildOnMouseEnter(territory.ID, g));
            g.addEventListener('mouseleave', buildOnMouseLeave(g));
          });
        }}
      />
    </div>
  );
};

export default CountryMap;
