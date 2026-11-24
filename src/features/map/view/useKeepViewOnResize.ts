import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect } from 'react';

import { applyZoomLimits, showWholeWorld } from './zoomLimits';

/** Keeps showing the same area when the map is resized, by zooming with its width. */
function useKeepViewOnResize(map: MapLibreMap | null) {
  useEffect(() => {
    if (!map) return;
    let lastWidth = map.getContainer().clientWidth;
    const onResize = () => {
      const width = map.getContainer().clientWidth;
      if (width === 0 || width === lastWidth) return;
      const wasShowingWorld = map.getZoom() <= map.getMinZoom() + 0.01;
      applyZoomLimits(map);
      // Moving the camera now would cut short an animation already heading somewhere, such as
      // the zoom onto newly filtered entities. The next resize catches up from lastWidth.
      if (map.isMoving()) return;
      const zoomChange = Math.log2(width / lastWidth);
      lastWidth = width;
      if (wasShowingWorld) showWholeWorld(map, 0);
      else map.setZoom(map.getZoom() + zoomChange);
    };
    map.on('resize', onResize);
    return () => {
      map.off('resize', onResize);
    };
  }, [map]);
}

export default useKeepViewOnResize;
