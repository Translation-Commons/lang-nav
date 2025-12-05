import { ChevronRightIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import LimitInput from '@features/pagination/LimitInput';
import usePageArrowKeys from '@features/pagination/usePageArrowKeys';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import ScaleBySelector from '@features/transforms/scales/ScaleBySelector';
import LanguageFilterSelector from '@features/transforms/filtering/LanguageFilterSelector';
import LanguageScopeSelector from '@features/transforms/filtering/LanguageScopeSelector';
import TerritoryFilterSelector from '@features/transforms/filtering/TerritoryFilterSelector';
import TerritoryScopeSelector from '@features/transforms/filtering/TerritoryScopeSelector';
import {
  VitalityEth2013Selector,
  VitalityEth2025Selector,
  LanguageISOStatusSelector,
} from '@features/transforms/filtering/VitalitySelector';
import WritingSystemFilterSelector from '@features/transforms/filtering/WritingSystemFilterSelector';
import SortBySelector from '@features/transforms/sorting/SortBySelector';
import SortDirectionSelector from '@features/transforms/sorting/SortDirectionSelector';

import { useClickOutside } from '@shared/hooks/useClickOutside';

import { ObjectiveList } from '../CommonObjectives';

import LanguageSourceSelector from './selectors/LanguageSourceSelector';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import PageBrightnessSelector from './selectors/PageBrightnessSelector';
import ProfileSelector from './selectors/ProfileSelector';
import ViewSelector from './selectors/ViewSelector';

import './controls.css';

const SidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [panelWidth, setPanelWidth] = React.useState(300); // but will change to pixels on resize

  // maybe collapse the panel if we click outside -- do UX testing first
  // const panelRef = useClickOutside(() => setIsOpen(false));
  const panelRef = useClickOutside(() => {});
  usePageArrowKeys();

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
          <div>{/* intentionally blank */}</div>
          <ObjectiveList />
        </SidePanelSection>

        <SidePanelSection panelWidth={panelWidth} title="Data" optionsName="data options">
          <ObjectTypeSelector />
          <LanguageSourceSelector display={SelectorDisplay.ButtonList} />
          <ProfileSelector />
        </SidePanelSection>

        <SidePanelSection panelWidth={panelWidth} title="Filter" optionsName="filters">
          <TerritoryFilterSelector display={SelectorDisplay.ButtonList} />
          <WritingSystemFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageScopeSelector />
          <TerritoryScopeSelector />
          <LanguageISOStatusSelector />
          <VitalityEth2013Selector />
          <VitalityEth2025Selector />
        </SidePanelSection>

        <SidePanelSection panelWidth={panelWidth} title="View" optionsName="view options">
          <ViewSelector />
          <LimitInput />
          <SortBySelector />
          <SortDirectionSelector />
          <ColorBySelector />
          <ScaleBySelector />
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
    optionsName: string;
  }>
> = ({ children, panelWidth, title, optionsName }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const childArray = React.Children.toArray(children);

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
        {childArray[0]}
        {isExpanded && childArray.slice(1)}
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
