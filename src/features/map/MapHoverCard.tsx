import { Tooltip } from '@base-ui/react/tooltip';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type MapHoverCardContextType = {
  showHoverCard: (content: React.ReactNode, x: number, y: number) => void;
  hideHoverCard: () => void;
};

const MapHoverCardContext = createContext<MapHoverCardContextType | null>(null);

/**
 * Imperative hovercard for the map. Map interactions live on SVG paths and centroids that
 * cannot host anchored Base UI triggers, so this provides a single cursor-anchored popup that
 * the map layers drive by coordinate. Self-contained (no global portal plumbing or z-index map).
 */
export const MapTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [open, setOpen] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });

  const anchor = useMemo(
    () => () => ({
      getBoundingClientRect: () => {
        const { x, y } = posRef.current;
        return {
          x,
          y,
          width: 0,
          height: 0,
          top: y,
          left: x,
          right: x,
          bottom: y,
          toJSON: () => ({}),
        } as DOMRect;
      },
    }),
    [],
  );

  const showHoverCard = useCallback((next: React.ReactNode, x: number, y: number) => {
    posRef.current = { x, y };
    setContent(next);
    setOpen(true);
  }, []);

  const hideHoverCard = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ showHoverCard, hideHoverCard }), [showHoverCard, hideHoverCard]);

  return (
    <MapHoverCardContext.Provider value={value}>
      {children}
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Portal>
          <Tooltip.Positioner anchor={anchor} side="top" sideOffset={12} className="z-50">
            <Tooltip.Popup className="max-w-72 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
              {content}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </MapHoverCardContext.Provider>
  );
};

const useMapHoverCard = (): MapHoverCardContextType => {
  const ctx = useContext(MapHoverCardContext);
  // Map layers can render in export/serialization paths without the provider; degrade to no-ops.
  return ctx ?? { showHoverCard: () => {}, hideHoverCard: () => {} };
};

export default useMapHoverCard;
