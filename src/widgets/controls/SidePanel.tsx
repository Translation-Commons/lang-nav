import { ChevronRightIcon } from 'lucide-react';
import React from 'react';

import WritingSystemFilterSelector from '@features/filtering/WritingSystemFilterSelector';
import HoverableButton from '@features/hovercard/HoverableButton';
import ColorBySelector from '@features/sorting/ColorBySelector';
import ColorGradientSelector from '@features/sorting/ColorGradientSelector';

import { useClickOutside } from '@shared/hooks/useClickOutside';

import TerritoryFilterSelector from '../../features/filtering/TerritoryFilterSelector';
import LimitInput from '../../features/pagination/LimitInput';
import SortBySelector from '../../features/sorting/SortBySelector';
import SortDirectionSelector from '../../features/sorting/SortDirectionSelector';
import { ObjectiveList } from '../CommonObjectives';

import { SelectorDisplay, SelectorDisplayProvider } from './components/SelectorDisplayContext';
import LanguageScopeSelector from './selectors/LanguageScopeSelector';
import LanguageListSourceSelector from './selectors/LanguageSourceSelector';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import PageBrightnessSelector from './selectors/PageBrightnessSelector';
import ProfileSelector from './selectors/ProfileSelector';
import TerritoryScopeSelector from './selectors/TerritoryScopeSelector';
import ViewSelector from './selectors/ViewSelector';
import {
  VitalityEth2013Selector,
  VitalityEth2025Selector,
  VitalityISOSelector,
} from './selectors/VitalitySelector';

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
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <SidePanelSection
          panelWidth={panelWidth}
          title="Common Actions"
          optionsName="common actions"
        >
          <ObjectiveList />
        </SidePanelSection>

        <SidePanelSection
          panelWidth={panelWidth}
          title="Data"
          optionsName="data options"
          alwaysShownNodes={<ObjectTypeSelector />}
        >
          <ProfileSelector />
          <LanguageListSourceSelector />
        </SidePanelSection>

        <SidePanelSection
          panelWidth={panelWidth}
          title="Filter"
          optionsName="filters"
          alwaysShownNodes={<TerritoryFilterSelector display={SelectorDisplay.ButtonList} />}
        >
          <WritingSystemFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageScopeSelector />
          <TerritoryScopeSelector />
          <VitalityISOSelector />
          <VitalityEth2013Selector />
          <VitalityEth2025Selector />
        </SidePanelSection>

        <SidePanelSection
          panelWidth={panelWidth}
          title="View"
          optionsName="view options"
          alwaysShownNodes={<ViewSelector />}
        >
          <LimitInput />
          <SortBySelector />
          <SortDirectionSelector />
          <ColorBySelector />
          <ColorGradientSelector />
          <LocaleSeparatorSelector />
          <PageBrightnessSelector />
        </SidePanelSection>

        <SidePanelToggleButton
          isOpen={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          panelWidth={panelWidth}
        />
      </SelectorDisplayProvider>
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
  React.PropsWithChildren<{
    panelWidth: number;
    title: string;
    alwaysShownNodes?: React.ReactNode;
    optionsName: string;
  }>
> = ({ children, panelWidth, title, alwaysShownNodes, optionsName }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      style={{
        borderTop: '0.125em solid var(--color-button-primary)',
        width: panelWidth,
        marginBottom: '0.5em',
      }}
    >
      <div
        style={{
          fontSize: '1.2em',
          fontWeight: 'lighter',
          borderRadius: '0',
          width: '100%',
          textAlign: 'left',
          backgroundColor: 'var(--color-button-secondary)',
          padding: '0.5em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          padding: '0.25em 0.5em',
          gap: '0.5em',
          flexDirection: 'column',
        }}
      >
        {alwaysShownNodes}
        {isExpanded && children}
        {
          <HoverableButton
            style={{ padding: '0em 0.25em' }}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? `close extra ${optionsName} ▲` : `see all ${optionsName} ▶`}
          </HoverableButton>
        }
      </div>
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
