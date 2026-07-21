import { XIcon } from 'lucide-react';
import React, { ReactNode, useCallback } from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@shared/ui/drawer';
import { ScrollArea } from '@shared/ui/scroll-area';

import useFilterPanel from './useFilterPanel';

type Props = {
  purpose: 'filters' | 'details'; // filters on left, details on right
  defaultWidth: number;
  title: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

// Only these reasons dismiss the drawer. Interacting with interior selectors, portalled
// dropdowns and hover cards must not close the panel out from under the user.
const EXPLICIT_DISMISSALS = new Set<string>([
  'escape-key',
  'outside-press',
  'close-press',
  'swipe',
]);

const ResizablePanel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  defaultWidth,
  isOpen,
  purpose,
  title,
  onClose,
}) => {
  const { isDesktop } = useFilterPanel();
  const panelSide = purpose === 'filters' ? 'left' : 'right';

  if (!isDesktop) {
    return (
      <Drawer
        swipeDirection={panelSide}
        open={isOpen}
        onOpenChange={(nextOpen, eventDetails) => {
          if (!nextOpen && EXPLICIT_DISMISSALS.has(eventDetails.reason)) onClose();
        }}
      >
        <DrawerContent
          style={{ '--drawer-content-width': 'min(20rem, 85vw)' } as React.CSSProperties}
        >
          <DrawerHeader className="flex-row items-center justify-between gap-2 border-b px-3 py-2 text-left">
            <DrawerTitle className="min-w-0 text-lg font-medium">{title}</DrawerTitle>
            <DrawerClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
              <XIcon />
            </DrawerClose>
          </DrawerHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="p-3">{children}</div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DesktopPanel
      defaultWidth={defaultWidth}
      isOpen={isOpen}
      panelSide={panelSide}
      title={title}
      onClose={onClose}
    >
      {children}
    </DesktopPanel>
  );
};

const DesktopPanel: React.FC<
  React.PropsWithChildren<{
    defaultWidth: number;
    isOpen: boolean;
    panelSide: 'left' | 'right';
    title: ReactNode;
    onClose: () => void;
  }>
> = ({ children, defaultWidth, isOpen, panelSide, title, onClose }) => {
  const [panelWidth, setPanelWidth] = React.useState(defaultWidth);
  const [shouldEaseTransition, setShouldEaseTransition] = React.useState(false);

  return (
    <aside
      className={cn(
        'relative overflow-hidden bg-card',
        panelSide === 'left' ? 'border-r border-border' : 'border-l border-border',
      )}
      style={{
        width: panelWidth,
        maxWidth: isOpen ? panelWidth : 0,
        transition: shouldEaseTransition ? 'max-width 0.3s ease-in-out' : undefined,
      }}
    >
      {isOpen && (
        <DraggableResizeBorder
          panelWidth={panelWidth}
          onResize={setPanelWidth}
          panelSide={panelSide}
          setShouldEaseTransition={setShouldEaseTransition}
        />
      )}
      <div className="flex h-full flex-col" style={{ width: panelWidth }}>
        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2',
            panelSide === 'right' && 'flex-row-reverse',
          )}
        >
          <div className="min-w-0 text-lg font-medium">{title}</div>
          <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <XIcon />
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">{children}</div>
        </ScrollArea>
      </div>
    </aside>
  );
};

const MIN_PANEL_WIDTH = 192; // 12rem
const clampPanelWidth = (width: number) =>
  Math.min(Math.max(width, MIN_PANEL_WIDTH), window.innerWidth * 0.6); // 60vw ceiling

const DraggableResizeBorder: React.FC<{
  panelWidth: number;
  onResize: (width: number) => void;
  panelSide: 'left' | 'right';
  setShouldEaseTransition: (value: boolean) => void;
}> = ({ panelWidth, onResize, panelSide, setShouldEaseTransition }) => {
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setShouldEaseTransition(false);
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = panelWidth;
      const onPointerMove = (moveEvent: PointerEvent) => {
        const delta =
          panelSide === 'left' ? moveEvent.clientX - startX : startX - moveEvent.clientX;
        onResize(clampPanelWidth(startWidth + delta));
      };
      // pointerup and pointercancel (e.g. OS scroll takeover) both end the drag and unbind.
      const stopDragging = () => {
        setShouldEaseTransition(true);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopDragging);
        window.removeEventListener('pointercancel', stopDragging);
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', stopDragging);
      window.addEventListener('pointercancel', stopDragging);
    },
    [panelWidth, onResize, panelSide, setShouldEaseTransition],
  );

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
      className={cn(
        'absolute top-0 z-40 h-full w-2 cursor-ew-resize touch-none hover:bg-border',
        panelSide === 'left' ? 'right-0' : 'left-0',
      )}
      onPointerDown={onPointerDown}
    />
  );
};

export default ResizablePanel;
