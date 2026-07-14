import { select, Selection } from 'd3-selection';
import 'd3-transition';
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity } from 'd3-zoom';
import { useCallback, useEffect, useRef } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type VisibleRange = {
  x: number; // Top-left corner X in map coordinates
  y: number; // Top-left corner Y in map coordinates
  width: number; // Visible width in map coordinates
  height: number; // Visible height in map coordinates
};

type UseMapZoomOptions = {
  mapWidth: number;
  mapHeight: number;
  maxZoomMultiplier?: number;
  onZoom?: (zoomFactor: number, visibleRange: VisibleRange) => void;
};

export type ZoomControlHandlers = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
};

type UseMapZoomReturn = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
};

// =============================================================================
// HOOK
// =============================================================================

export const useMapZoom = ({
  mapWidth,
  mapHeight,
  maxZoomMultiplier = 8,
  onZoom,
}: UseMapZoomOptions): UseMapZoomReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const selectionRef = useRef<Selection<HTMLDivElement, unknown, null, undefined> | null>(null);

  const visibleRangeRef = useRef<VisibleRange>({
    x: 0,
    y: 0,
    width: mapWidth,
    height: mapHeight,
  });

  const lastContainerWidthRef = useRef<number>(0);

  const getBaseScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 1;
    return container.clientWidth / mapWidth;
  }, [mapWidth]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const selection = select(container) as Selection<HTMLDivElement, unknown, null, undefined>;
    selectionRef.current = selection;

    const baseScale = getBaseScale();
    lastContainerWidthRef.current = container.clientWidth;

    visibleRangeRef.current = {
      x: 0,
      y: 0,
      width: mapWidth,
      height: mapHeight,
    };

    const zoomBehavior = zoom<HTMLDivElement, unknown>()
      .scaleExtent([baseScale, baseScale * maxZoomMultiplier])
      .on('zoom', (event: D3ZoomEvent<HTMLDivElement, unknown>) => {
        const { transform } = event;

        content.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
        content.style.transformOrigin = '0 0';

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        visibleRangeRef.current = {
          x: -transform.x / transform.k,
          y: -transform.y / transform.k,
          width: containerWidth / transform.k,
          height: containerHeight / transform.k,
        };

        const currentBaseScale = container.clientWidth / mapWidth;
        onZoom?.(transform.k / currentBaseScale, visibleRangeRef.current);
      });

    zoomBehaviorRef.current = zoomBehavior;
    selection.call(zoomBehavior);

    const initialTransform = zoomIdentity.scale(baseScale);
    selection.call(zoomBehavior.transform, initialTransform);

    const ro = new ResizeObserver(() => {
      const newContainerWidth = container.clientWidth;

      if (Math.abs(newContainerWidth - lastContainerWidthRef.current) < 1) {
        return;
      }

      const { x, y, width } = visibleRangeRef.current;

      const newScale = newContainerWidth / width;
      const newX = -x * newScale;
      const newY = -y * newScale;

      const newBaseScale = newContainerWidth / mapWidth;
      zoomBehavior.scaleExtent([newBaseScale, newBaseScale * maxZoomMultiplier]);

      const newTransform = zoomIdentity.translate(newX, newY).scale(newScale);
      selection.call(zoomBehavior.transform, newTransform);

      lastContainerWidthRef.current = newContainerWidth;
    });

    ro.observe(container);

    return () => {
      ro.disconnect();
      selection.on('.zoom', null);
    };
  }, [getBaseScale, mapWidth, mapHeight, maxZoomMultiplier]);

  const zoomIn = useCallback(() => {
    const selection = selectionRef.current;
    const zoomBehavior = zoomBehaviorRef.current;
    if (selection && zoomBehavior) {
      selection.transition().duration(300).call(zoomBehavior.scaleBy, 1.5);
    }
  }, []);

  const zoomOut = useCallback(() => {
    const selection = selectionRef.current;
    const zoomBehavior = zoomBehaviorRef.current;
    if (selection && zoomBehavior) {
      selection.transition().duration(300).call(zoomBehavior.scaleBy, 0.67);
    }
  }, []);

  const resetTransform = useCallback(() => {
    const selection = selectionRef.current;
    const zoomBehavior = zoomBehaviorRef.current;
    const container = containerRef.current;
    if (selection && zoomBehavior && container) {
      const baseScale = container.clientWidth / mapWidth;
      const resetTransform = zoomIdentity.scale(baseScale);
      selection.transition().duration(300).call(zoomBehavior.transform, resetTransform);
    }
  }, [mapWidth]);

  return {
    containerRef,
    contentRef,
    zoomIn,
    zoomOut,
    resetTransform,
  };
};

export default useMapZoom;
