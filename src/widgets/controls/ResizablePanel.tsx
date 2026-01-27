import React, { useCallback, useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

import SidePanelToggleButton from './SidePanelToggleButton';

type Props = {
  panelSide: 'left' | 'right';
  defaultWidth: number;
  isOpenedWithObject: boolean;
};

const ResizablePanel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  defaultWidth,
  panelSide,
  isOpenedWithObject,
}) => {
  const { objectID } = usePageParams();
  const [isOpen, setIsOpen] = React.useState(!isOpenedWithObject);
  const [panelWidth, setPanelWidth] = React.useState(defaultWidth); // but will change to pixels on resize

  useEffect(() => {
    // When an object is set, close the side panel
    if (objectID) setIsOpen(isOpenedWithObject);
  }, [objectID, isOpenedWithObject]);

  return (
    <aside
      style={{
        width: panelWidth,
        maxWidth: isOpen ? panelWidth : '0',
        overflowY: 'scroll',
        overflowX: 'hidden',
        borderRight: panelSide === 'left' ? '2px solid var(--color-button-primary)' : undefined,
        borderLeft: panelSide === 'right' ? '2px solid var(--color-button-primary)' : undefined,
        transition: 'max-width 0.3s ease-in-out',
        position: 'relative',
      }}
    >
      {isOpen && (
        <DraggableResizeBorder
          panelWidth={panelWidth}
          onResize={setPanelWidth}
          panelSide={panelSide}
        />
      )}
      <div
        style={{
          // maxWidth: isOpen ? panelWidth : '0',
          // transition: 'max-width 0.3s ease-in-out',
          right: panelSide === 'right' ? 0 : undefined,
          width: panelWidth, // keeps the inner content from shrinking when collapsing
        }}
      >
        {children}
      </div>

      <SidePanelToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        panelWidth={panelWidth}
        panelSide={panelSide}
      />
    </aside>
  );
};

const DraggableResizeBorder: React.FC<{
  panelWidth: number;
  onResize: (width: number) => void;
  panelSide: 'left' | 'right';
}> = ({ panelWidth, onResize, panelSide }) => {
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
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
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [panelWidth, onResize, panelSide],
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
        zIndex: 10,
      }}
      onMouseDown={onMouseDown}
    />
  );
};

export default ResizablePanel;
