import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';

import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { getRobinsonCoordinatesShifted } from '../getRobinsonCoordinates';
import { MAP_INTERNAL_WIDTH, MAP_ROBINSON_X_SCALE, MAP_ROBINSON_Y_SCALE } from '../MapConsts';
import { MapTransform } from '../UseMapZoom';

import { getLabelMinZooms } from './getLabelMinZooms';
import { measureLabelText } from './measureLabelText';

// Applied inline below rather than in map.css, so the size measured here for spacing names
// out is always the size actually drawn.
const FONT_PX = 11;
const FONT_WEIGHT = 600;
const CHIP_PADDING_X_PX = 8;
const CHIP_BORDER_PX = 1;
const CHIP_HEIGHT_PX = 20;

type Props = {
  transform: MapTransform;
  zoomFactor: number;
  /** Screen width of the map at zoom 1, in pixels. */
  mapWidthPx: number;
  /** Height of the map in map coordinates. */
  mapHeight: number;
};

type CountryName = {
  territory: TerritoryData;
  /** Position in map coordinates, the same space the zoom transform applies to. */
  mapX: number;
  mapY: number;
  chipWidthPx: number;
};

/**
 * Country names, revealed as the user zooms in: the most populous countries are named first,
 * and smaller ones appear once there's room for them.
 *
 * Drawn as plain HTML on top of the map, not inside its zoomed layer. In there the text has to
 * be shrunk to cancel out the zoom, and the browser's rounding at that tiny size gets magnified
 * back up until names visibly slide off-centre in their chips.
 */
const MapCountryLabels: React.FC<Props> = ({ transform, zoomFactor, mapWidthPx, mapHeight }) => {
  const { territories } = useDataContext();

  const names = useMemo(() => getCountryNames(territories, mapHeight), [territories, mapHeight]);

  const pixelsPerUnitAtZoom1 = mapWidthPx / MAP_INTERNAL_WIDTH;
  const minZooms = useMemo(
    () =>
      getLabelMinZooms(
        names.map(({ territory, mapX, mapY, chipWidthPx }) => ({
          id: territory.ID,
          x: mapX * pixelsPerUnitAtZoom1,
          y: mapY * pixelsPerUnitAtZoom1,
          width: chipWidthPx,
          height: CHIP_HEIGHT_PX,
        })),
      ),
    [names, pixelsPerUnitAtZoom1],
  );

  return (
    // Purely visual, so screen readers don't read out dozens of names as the map moves.
    <div className="MapCountryLabels" aria-hidden="true">
      {names.map(({ territory, mapX, mapY }) => {
        const minZoom = minZooms.get(territory.ID);
        if (minZoom == null || zoomFactor < minZoom) return null;
        const x = transform.translateX + mapX * transform.scale;
        const y = transform.translateY + mapY * transform.scale;
        return (
          <div
            key={territory.ID}
            className="MapCountryLabel"
            style={{
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
              height: CHIP_HEIGHT_PX,
              padding: `0 ${CHIP_PADDING_X_PX}px`,
              borderWidth: CHIP_BORDER_PX,
              fontSize: FONT_PX,
              fontWeight: FONT_WEIGHT,
            }}
          >
            {territory.nameDisplay}
          </div>
        );
      })}
    </div>
  );
};

/** Countries and dependencies that have a position, most populous first. */
function getCountryNames(territories: TerritoryData[], mapHeight: number): CountryName[] {
  // Same placement as the dot overlay: viewBox "-180 -90 360 180", centred with "meet".
  const svgScale = Math.min(MAP_INTERNAL_WIDTH / 360, mapHeight / 180);
  const offsetX = (MAP_INTERNAL_WIDTH - 360 * svgScale) / 2;
  const offsetY = (mapHeight - 180 * svgScale) / 2;

  return territories
    .filter(
      (t) =>
        (t.scope === TerritoryScope.Country || t.scope === TerritoryScope.Dependency) &&
        t.latitude != null &&
        t.longitude != null,
    )
    .sort((a, b) => b.pop.overall - a.pop.overall)
    .map((territory) => {
      const { x, y } = getRobinsonCoordinatesShifted(territory);
      const textWidth = measureLabelText(territory.nameDisplay, FONT_PX, FONT_WEIGHT);
      return {
        territory,
        mapX: (x * MAP_ROBINSON_X_SCALE + 180) * svgScale + offsetX,
        mapY: (-y * MAP_ROBINSON_Y_SCALE + 90) * svgScale + offsetY,
        chipWidthPx: textWidth + (CHIP_PADDING_X_PX + CHIP_BORDER_PX) * 2,
      };
    });
}

export default MapCountryLabels;
