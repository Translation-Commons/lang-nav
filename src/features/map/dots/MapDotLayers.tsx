import type { FeatureCollection, Point } from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';
import React from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

import { DOTS_LAYER_ID, DOTS_SOURCE_ID } from '../mapLayerIds';
import type { MapThemeColors } from '../style/useMapThemeColors';

import type { DotProperties } from './buildDotFeatures';

// The page's own font stack, drawn by the browser so every script renders.
const LABEL_FONTS = ['Avenir', 'Helvetica', 'Arial', 'sans-serif'];

type Props = {
  dots: FeatureCollection<Point, DotProperties>;
  pinnedIds: string[];
  colors: MapThemeColors;
};

const MapDotLayers: React.FC<Props> = ({ dots, pinnedIds, colors }) => {
  const isHovered: ExpressionSpecification = ['boolean', ['feature-state', 'hover'], false];
  const isPinned: ExpressionSpecification = ['in', ['get', 'id'], ['literal', pinnedIds]];

  return (
    <Source id={DOTS_SOURCE_ID} type="geojson" data={dots} promoteId="id">
      <Layer
        id={DOTS_LAYER_ID}
        type="circle"
        filter={['get', 'hasDot']}
        layout={{ 'circle-sort-key': ['get', 'order'] }}
        paint={{
          'circle-radius': ['*', ['get', 'radius'], ['case', isHovered, 1.5, 1]],
          'circle-color': ['get', 'fillColor'],
          'circle-stroke-color': [
            'case',
            ['any', isHovered, isPinned],
            colors.primary,
            ['get', 'strokeColor'],
          ],
          'circle-stroke-width': ['get', 'strokeWidth'],
          'circle-radius-transition': { duration: 250 },
        }}
      />
      <Layer
        id="dot-labels"
        type="symbol"
        filter={['!=', ['get', 'label'], '']}
        layout={{
          'text-field': ['get', 'label'],
          'text-font': LABEL_FONTS,
          'text-size': ['get', 'labelSize'],
          'text-anchor': ['case', ['get', 'hasDot'], 'top', 'center'],
          'text-offset': ['array', 'number', 2, ['get', 'labelOffset']],
          // Most important first, so when labels collide the bigger ones stay.
          'symbol-sort-key': ['-', ['get', 'order']],
        }}
        paint={{
          'text-color': colors.text,
          'text-halo-color': colors.ocean,
          'text-halo-width': 1,
        }}
      />
    </Source>
  );
};

export default MapDotLayers;
