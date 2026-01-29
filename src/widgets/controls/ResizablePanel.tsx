import React, { ReactNode, useCallback, useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

import SidePanelToggleButton from './SidePanelToggleButton';

type Props = {
  purpose: 'filters' | 'details'; // filters on left, details on right
  defaultWidth: number;
  title: ReactNode;
};

const ResizablePanel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  defaultWidth,
  purpose,
  title,
}) => {
  const { objectID } = usePageParams();
  const [isOpen, setIsOpen] = React.useState(purpose === 'filters');
  const [panelWidth, setPanelWidth] = React.useState(defaultWidth); // but will change to pixels on resize
  const panelSide = purpose === 'filters' ? 'left' : 'right';
  const [shouldEaseTransition, setShouldEaseTransition] = React.useState(false);

  useEffect(() => {
    // When an object is set, close the side panel
    if (objectID) setIsOpen(purpose === 'details');
  }, [objectID, purpose]);

  return (
    <aside
      style={{
        width: panelWidth,
        maxWidth: isOpen ? panelWidth : '0',
        borderRight: panelSide === 'left' ? '2px solid var(--color-button-primary)' : undefined,
        borderLeft: panelSide === 'right' ? '2px solid var(--color-button-primary)' : undefined,
        transition: shouldEaseTransition ? 'max-width 0.3s ease-in-out' : undefined,
        overflowX: 'hidden',
        position: 'relative',
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignContent: panelSide === 'left' ? 'flex-start' : 'flex-end',
          right: panelSide === 'right' ? 0 : undefined,
          // keeps the inner content from shrinking when collapsing
          width: panelWidth,
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '2em', padding: '0.25em' }}> {title}</div>
        <div
          style={{
            overflowY: 'scroll',
            overflowX: 'hidden',
            height: '90vh',
            width: panelWidth,
          }}
        >
          {children}
        </div>
      </div>

      <SidePanelToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        panelWidth={panelWidth}
        purpose={purpose}
      />
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
        zIndex: 10,
      }}
      onMouseDown={onMouseDown}
    />
  );
};

export default ResizablePanel;
