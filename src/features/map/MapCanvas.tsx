import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMapInstance, MapLayerMouseEvent, MapMouseEvent } from 'maplibre-gl';
import React, { useMemo } from 'react';
import MapLibreMap from 'react-map-gl/maplibre';

import MapDotLayers from './dots/MapDotLayers';
import './style/setUpMapLibre';
import { getBaseMapStyle } from './style/getBaseMapStyle';
import type { MapThemeColors } from './style/useMapThemeColors';
import MapTerritoryLayers from './territories/MapTerritoryLayers';
import type useMapContent from './useMapContent';
import markMapIdle from './view/markMapIdle';
import { WORLD_BOUNDS } from './view/zoomLimits';

// Screen readers announce the canvas by this name.
const MAP_LABELS = { 'Map.Title': 'World map' };

type Props = {
  content: ReturnType<typeof useMapContent>;
  colors: MapThemeColors;
  pinnedIds: string[];
  interactiveLayerIds: string[];
  cursor: string;
  onLoad: (map: MapLibreMapInstance) => void;
  onMouseMove: (event: MapLayerMouseEvent) => void;
  onMouseOut: (event: MapMouseEvent) => void;
  onClick: (event: MapMouseEvent) => void;
};

const MapCanvas: React.FC<Props> = ({ content, colors, pinnedIds, onLoad, ...pointer }) => {
  // A new style only on theme change; react-map-gl re-adds the child layers on top of it.
  const mapStyle = useMemo(() => getBaseMapStyle(colors), [colors]);

  return (
    <MapLibreMap
      initialViewState={{ bounds: WORLD_BOUNDS }}
      mapStyle={mapStyle}
      onLoad={(event) => {
        markMapIdle(event.target);
        onLoad(event.target);
      }}
      locale={MAP_LABELS}
      {...pointer}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      attributionControl={false}
    >
      {content.showTerritories && (
        <MapTerritoryLayers
          territoryIds={content.territoryIds}
          fill={content.territoryFill}
          pinnedIds={pinnedIds}
          outlineColor={colors.text}
        />
      )}
      <MapDotLayers dots={content.dots} pinnedIds={pinnedIds} colors={colors} />
    </MapLibreMap>
  );
};

export default MapCanvas;
