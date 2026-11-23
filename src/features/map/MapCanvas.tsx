import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMapInstance, MapLayerMouseEvent, MapMouseEvent } from 'maplibre-gl';
import React, { useMemo } from 'react';
import MapLibreMap from 'react-map-gl/maplibre';

import usePageParams from '@features/params/usePageParams';

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
  minOrder: number;
  interactiveLayerIds: string[];
  cursor: string;
  onLoad: (map: MapLibreMapInstance) => void;
  onMouseMove: (event: MapLayerMouseEvent) => void;
  onMouseOut: (event: MapMouseEvent) => void;
  onClick: (event: MapMouseEvent) => void;
};

const MapCanvas: React.FC<Props> = ({
  content,
  colors,
  pinnedIds,
  minOrder,
  onLoad,
  ...pointer
}) => {
  // A new style only when the theme or borders change; react-map-gl re-adds the layers below.
  const { showMapBorders } = usePageParams();
  const mapStyle = useMemo(() => getBaseMapStyle(colors, showMapBorders), [colors, showMapBorders]);

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
          showOutline={showMapBorders}
        />
      )}
      <MapDotLayers
        dots={content.dots}
        pinnedIds={pinnedIds}
        colors={colors}
        minOrder={minOrder}
        showLabels={content.showLabels}
      />
    </MapLibreMap>
  );
};

export default MapCanvas;
