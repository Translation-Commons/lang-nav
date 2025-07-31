import { ChevronRightIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '../generic/HoverableButton';
import { useClickOutside } from '../generic/useClickOutside';

import LanguageScopeSelector from './selectors/LanguageScopeSelector';
import LanguageListSourceSelector from './selectors/LanguageSourceSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import SortBySelector from './selectors/SortBySelector';
import TerritoryFilterSelector from './selectors/TerritoryFilterSelector';
import TerritoryScopeSelector from './selectors/TerritoryScopeSelector';
import ViewSelector from './selectors/ViewSelector';

import './controls.css';

const SidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [panelWidth, setPanelWidth] = React.useState(300); // but will change to pixels on resize

  // maybe collapse the panel if we click outside -- do UX testing first
  // const panelRef = useClickOutside(() => setIsOpen(false));
  const panelRef = useClickOutside(() => {});

  return (
    <LeftAlignedPanel
      isOpen={isOpen}
      panelWidth={panelWidth}
      setPanelWidth={setPanelWidth}
      panelRef={panelRef}
    >
      <SidePanelSection panelWidth={panelWidth}>
        <SidePanelSectionTitle>Data</SidePanelSectionTitle>
        <ObjectTypeSelector />
        <LanguageListSourceSelector />
      </SidePanelSection>

      <SidePanelSection panelWidth={panelWidth}>
        <SidePanelSectionTitle>Filters</SidePanelSectionTitle>
        <LanguageScopeSelector />
        <TerritoryScopeSelector />
        <TerritoryFilterSelector />
      </SidePanelSection>

      <SidePanelSection panelWidth={panelWidth}>
        <SidePanelSectionTitle>View Options</SidePanelSectionTitle>
        <ViewSelector />
        <LimitInput />
        <SortBySelector />
        <LocaleSeparatorSelector />
      </SidePanelSection>

      <SidePanelToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        panelWidth={panelWidth}
      />
    </LeftAlignedPanel>
  );
};

const LeftAlignedPanel: React.FC<
  React.PropsWithChildren<{
    isOpen: boolean;
    panelWidth: number;
    setPanelWidth: (width: number) => void;
    panelRef?: React.RefObject<HTMLDivElement | null>;
  }>
> = ({ children, isOpen, panelWidth, setPanelWidth, panelRef }) => {
  return (
    <aside
      ref={panelRef}
      style={{
        width: panelWidth,
        maxWidth: isOpen ? panelWidth : '0',
        overflowY: 'scroll',
        overflowX: 'hidden',
        borderRight: '2px solid var(--color-button-primary)',
        transition: 'max-width 0.3s ease-in-out',
        paddingTop: '0.5em',
        position: 'relative',
      }}
    >
      {isOpen && <DraggableResizeBorder panelWidth={panelWidth} onResize={setPanelWidth} />}
      {children}
    </aside>
  );
};

const SidePanelToggleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  panelWidth: number;
}> = ({ isOpen, onClick, panelWidth }) => {
  return (
    <div className="selector rounded">
      <HoverableButton
        hoverContent={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
        className={isOpen ? 'selected' : ''}
        onClick={onClick}
        style={{
          position: 'fixed',
          top: '50%',
          left: isOpen ? panelWidth : '1.5em',
          transform: 'translateX(-50%) translateY(-50%)', // move it to the center of its position
          zIndex: 1000,
          transition: 'left 0.3s ease-in-out',
        }}
        aria-label={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
      >
        <ChevronRightIcon
          size="1em"
          display="block"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      </HoverableButton>
    </div>
  );
};

const SidePanelSection: React.FC<React.PropsWithChildren<{ panelWidth: number }>> = ({
  children,
  panelWidth,
}) => {
  return (
    <div
      style={{
        borderBottom: '0.125em solid var(--color-button-primary)',
        width: panelWidth,
        padding: '0.25em 0.5em',
        marginBottom: '0.5em',
      }}
    >
      {children}
    </div>
  );
};

const SidePanelSectionTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ fontSize: '1.2em', fontWeight: 'lighter' }}>{children}</div>;
};

const DraggableResizeBorder: React.FC<{
  panelWidth: number;
  onResize: (width: number) => void;
}> = ({ panelWidth, onResize }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '0.5em',
        height: '100%',
        cursor: 'ew-resize',
        zIndex: 10,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = panelWidth;
        const onMouseMove = (moveEvent: MouseEvent) => {
          const delta = moveEvent.clientX - startX;
          onResize(startWidth + delta);
        };
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }}
    />
  );
};

export default SidePanel;
