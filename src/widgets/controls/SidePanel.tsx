import { useClickOutside } from '@shared/hooks/useClickOutside';
import HoverableButton from '@shared/ui/HoverableButton';
import { ChevronRightIcon } from 'lucide-react';
import React from 'react';

import { ObjectiveList } from '../CommonObjectives';

import LanguageScopeSelector from './selectors/LanguageScopeSelector';
import LanguageListSourceSelector from './selectors/LanguageSourceSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import ProfileSelector from './selectors/ProfileSelector';
import SortBySelector from './selectors/SortBySelector';
import SortDirectionSelector from './selectors/SortDirectionSelector';
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
      <SidePanelSection panelWidth={panelWidth} title="Common Actions">
        <ObjectiveList />
      </SidePanelSection>

      <SidePanelSection panelWidth={panelWidth} title="Data">
        <ProfileSelector />
        <ObjectTypeSelector />
        <LanguageListSourceSelector />
      </SidePanelSection>

      <SidePanelSection panelWidth={panelWidth} title="Filters">
        <LanguageScopeSelector />
        <TerritoryScopeSelector />
        <TerritoryFilterSelector />
      </SidePanelSection>

      <SidePanelSection panelWidth={panelWidth} title="View Options">
        <ViewSelector />
        <LimitInput />
        <SortBySelector />
        <SortDirectionSelector />
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
    <HoverableButton
      hoverContent={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
      className={isOpen ? 'selected primary' : 'primary'}
      onClick={onClick}
      style={{
        borderRadius: '1em',
        padding: '.5em',
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
  );
};

const SidePanelSection: React.FC<
  React.PropsWithChildren<{ panelWidth: number; title: string }>
> = ({ children, panelWidth, title }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      style={{
        borderTop: '0.125em solid var(--color-button-primary)',
        width: panelWidth,
        marginBottom: '0.5em',
      }}
    >
      <HoverableButton
        style={{
          fontSize: '1.2em',
          fontWeight: 'lighter',
          borderRadius: '0',
          width: '100%',
          textAlign: 'left',
        }}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {title} {isExpanded ? '▼' : '▶'}
      </HoverableButton>
      <div style={{ padding: '0.25em 0.5em' }}>{isExpanded && children}</div>
    </div>
  );
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
