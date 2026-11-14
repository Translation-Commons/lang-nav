import type { ExpressionSpecification } from 'maplibre-gl';
import React from 'react';
import { Layer } from 'react-map-gl/maplibre';

import {
  BORDERS_LAYER_ID,
  COUNTRIES_SOURCE_ID,
  OVERLAYS_START_LAYER_ID,
  TERRITORIES_LAYER_ID,
} from '../mapLayerIds';

type Props = {
  territoryIds: string[];
  fill: { color: ExpressionSpecification | string; opacity: ExpressionSpecification | number };
  pinnedIds: string[];
  outlineColor: string;
};

/**
 * Colours the countries we have data on, and outlines the hovered and pinned ones in the text
 * colour, which stands out against any fill colour.
 */
const MapTerritoryLayers: React.FC<Props> = ({ territoryIds, fill, pinnedIds, outlineColor }) => {
  const isOurTerritory: ExpressionSpecification = ['in', ['get', 'iso'], ['literal', territoryIds]];
  const isHighlighted: ExpressionSpecification = [
    'any',
    ['boolean', ['feature-state', 'hover'], false],
    ['in', ['get', 'iso'], ['literal', pinnedIds]],
  ];

  return (
    <>
      <Layer
        id={TERRITORIES_LAYER_ID}
        type="fill"
        source={COUNTRIES_SOURCE_ID}
        beforeId={BORDERS_LAYER_ID}
        filter={isOurTerritory}
        paint={{ 'fill-color': fill.color, 'fill-opacity': fill.opacity }}
      />
      <Layer
        id="territory-highlight"
        type="line"
        source={COUNTRIES_SOURCE_ID}
        beforeId={OVERLAYS_START_LAYER_ID}
        filter={isOurTerritory}
        paint={{
          'line-color': outlineColor,
          'line-width': ['case', isHighlighted, 2, 0],
        }}
      />
    </>
  );
};

export default MapTerritoryLayers;
