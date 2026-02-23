import { select, Selection } from 'd3-selection';
import 'd3-transition';
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity } from 'd3-zoom';
import { useCallback, useEffect, useRef } from 'react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Represents the currently visible area of the map in "map coordinates".
 * This is the KEY concept for maintaining consistent view on resize.
 */
type VisibleRange = {
  x: number; // Top-left corner X in map coordinates
  y: number; // Top-left corner Y in map coordinates
  width: number; // Visible width in map coordinates
  height: number; // Visible height in map coordinates
};

type UseMapZoomOptions = {
  /** Fixed map width in "map coordinate" units */
  mapWidth: number;
  /** Fixed map height in "map coordinate" units */
  mapHeight: number;
  /** Maximum zoom multiplier (default: 8) */
  maxZoomMultiplier?: number;
};

/** Zoom control handlers - shared with ZoomControls component */
export type ZoomControlHandlers = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
};

type UseMapZoomReturn = {
  /** Ref to attach to the container (viewport) element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to attach to the content (map) element */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /** Zoom in handler */
  zoomIn: () => void;
  /** Zoom out handler */
  zoomOut: () => void;
  /** Reset zoom handler */
  resetTransform: () => void;
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook for D3-based map zoom/pan with resize handling.
 *
 * Key feature: Maintains the same visible map region when container resizes.
 * This is achieved by tracking "what the user sees" (visibleRange) rather than
 * the transform parameters (scale + position).
 *
 * @example
 * const { containerRef, contentRef, handleZoomIn, handleZoomOut, handleReset } = useMapZoom({
 *   mapWidth: 1000,
 *   mapHeight: 505,
 * });
 */
export const useMapZoom = ({
  mapWidth,
  mapHeight,
  maxZoomMultiplier = 8,
}: UseMapZoomOptions): UseMapZoomReturn => {
  // ---------------------------------------------------------------------------
  // REFS
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const selectionRef = useRef<Selection<HTMLDivElement, unknown, null, undefined> | null>(null);

  /**
   * THE KEY STATE: What region of the map is currently visible?
   * Tracked in "map coordinates", not pixels.
   */
  const visibleRangeRef = useRef<VisibleRange>({
    x: 0,
    y: 0,
    width: mapWidth,
    height: mapHeight,
  });

  const lastContainerWidthRef = useRef<number>(0);

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Calculate the "base scale" - the scale at which the map exactly fills
   * the container width.
   */
  const getBaseScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 1;
    return container.clientWidth / mapWidth;
  }, [mapWidth]);

  // ---------------------------------------------------------------------------
  // D3 ZOOM SETUP & RESIZE HANDLING
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Initialize D3 selection
    const selection = select(container) as Selection<HTMLDivElement, unknown, null, undefined>;
    selectionRef.current = selection;

    const baseScale = getBaseScale();
    lastContainerWidthRef.current = container.clientWidth;

    // Initialize visible range to show the entire map
    visibleRangeRef.current = {
      x: 0,
      y: 0,
      width: mapWidth,
      height: mapHeight,
    };

    // Create zoom behavior
    const zoomBehavior = zoom<HTMLDivElement, unknown>()
      .scaleExtent([baseScale, baseScale * maxZoomMultiplier])
      .on('zoom', (event: D3ZoomEvent<HTMLDivElement, unknown>) => {
        const { transform } = event;

        // Apply CSS transform directly to the content element
        content.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
        content.style.transformOrigin = '0 0';

        // Update visibleRange based on current transform
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        visibleRangeRef.current = {
          x: -transform.x / transform.k,
          y: -transform.y / transform.k,
          width: containerWidth / transform.k,
          height: containerHeight / transform.k,
        };
      });

    zoomBehaviorRef.current = zoomBehavior;
    selection.call(zoomBehavior);

    // Set initial transform
    const initialTransform = zoomIdentity.scale(baseScale);
    selection.call(zoomBehavior.transform, initialTransform);

    // ResizeObserver: maintain visible range on resize
    const ro = new ResizeObserver(() => {
      const newContainerWidth = container.clientWidth;

      if (Math.abs(newContainerWidth - lastContainerWidthRef.current) < 1) {
        return;
      }

      const { x, y, width } = visibleRangeRef.current;

      // Core resize logic: calculate new scale to show same map region
      const newScale = newContainerWidth / width;
      const newX = -x * newScale;
      const newY = -y * newScale;

      // Update scale extent
      const newBaseScale = newContainerWidth / mapWidth;
      zoomBehavior.scaleExtent([newBaseScale, newBaseScale * maxZoomMultiplier]);

      // Apply new transform
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

  // ---------------------------------------------------------------------------
  // ZOOM CONTROL HANDLERS
  // ---------------------------------------------------------------------------

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
