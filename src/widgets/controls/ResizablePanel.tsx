import { XIcon } from 'lucide-react';
import React, { ReactNode, useCallback } from 'react';

import ZIndex from '@features/layers/ZIndex';

import { Button } from '@shared/ui/button';

type Props = {
  purpose: 'filters' | 'details'; // filters on left, details on right
  defaultWidth: number;
  title: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const ResizablePanel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  defaultWidth,
  isOpen,
  purpose,
  title,
  onClose,
}) => {
  const [panelWidth, setPanelWidth] = React.useState(defaultWidth);
  const panelSide = purpose === 'filters' ? 'left' : 'right';
  const [shouldEaseTransition, setShouldEaseTransition] = React.useState(false);

  return (
    <aside
      className="relative h-full flex-shrink-0 overflow-hidden"
      style={{
        // Anchors DraggableResizeBorder's `position: absolute` to this element -- without it,
        // the drag handle positions against a distant ancestor instead and silently inflates
        // the page's real scrollable height.
        width: panelWidth,
        maxWidth: isOpen ? panelWidth : '0',
        borderRight: panelSide === 'left' ? '2px solid var(--color-button-primary)' : undefined,
        borderLeft: panelSide === 'right' ? '2px solid var(--color-button-primary)' : undefined,
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
      <div
        className="flex flex-col h-full"
        style={{
          alignContent: panelSide === 'left' ? 'flex-start' : 'flex-end',
          right: panelSide === 'right' ? 0 : undefined,
          // keeps the inner content from shrinking when collapsing
          width: panelWidth,
        }}
      >
        <div className="w-full flex justify-center text-center relative pt-3 px-2 text-3xl">
          <Button
            variant="secondary"
            className="absolute top-0 right-0 size-6"
            onClick={onClose}
            style={{
              right: panelSide === 'right' ? '0.25em' : undefined,
              left: panelSide === 'left' ? '0.25em' : undefined,
            }}
            aria-label="Close"
          >
            <XIcon />
          </Button>
          {title}
        </div>
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-2"
          style={{ width: panelWidth }}
        >
          {children}
        </div>
      </div>
    </aside>
  );
};

const DraggableResizeBorder: React.FC<{
  panelWidth: number;
  onResize: (width: number) => void;
  panelSide: 'left' | 'right';
  setShouldEaseTransition: (value: boolean) => void;
}> = ({ panelWidth, onResize, panelSide, setShouldEaseTransition }) => {
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setShouldEaseTransition(false);
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = panelWidth;
      const onMouseMove = (moveEvent: MouseEvent) => {
        if (panelSide === 'left') {
          const delta = moveEvent.clientX - startX;
          onResize(startWidth + delta);
        } else {
          const delta = startX - moveEvent.clientX;
          onResize(startWidth + delta);
        }
      };
      const onMouseUp = () => {
        setShouldEaseTransition(true);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [panelWidth, onResize, panelSide, setShouldEaseTransition],
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: panelSide === 'left' ? 0 : undefined,
        left: panelSide === 'right' ? 0 : undefined,
        width: '0.5em',
        height: '100%',
        cursor: 'ew-resize',
        zIndex: ZIndex.Sidepanel,
      }}
      onMouseDown={onMouseDown}
    />
  );
};

export default ResizablePanel;
