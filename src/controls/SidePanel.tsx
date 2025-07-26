import { FilterIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '../generic/HoverableButton';

import LanguageSchemaSelector from './selectors/LanguageSchemaSelector';
import LanguageScopeSelector from './selectors/LanguageScopeSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import SortBySelector from './selectors/SortBySelector';
import TerritoryFilter from './selectors/TerritoryFilter';
import TerritoryScopeSelector from './selectors/TerritoryScopeSelector';
import ViewSelector from './selectors/ViewSelector';

const PANEL_WIDTH = '20em';

const SidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <LeftAlignedPanel isOpen={isOpen}>
      <SidePanelSection>
        <SidePanelSectionTitle>Data</SidePanelSectionTitle>
        <ObjectTypeSelector />
        <LanguageSchemaSelector />
      </SidePanelSection>

      <SidePanelSection>
        <SidePanelSectionTitle>Filters</SidePanelSectionTitle>
        <LanguageScopeSelector />
        <TerritoryScopeSelector />
        <TerritoryFilter />
      </SidePanelSection>

      <SidePanelSection>
        <SidePanelSectionTitle>View Options</SidePanelSectionTitle>
        <ViewSelector />
        <LimitInput />
        <SortBySelector />
        <LocaleSeparatorSelector />
      </SidePanelSection>

      <SidePanelToggleButton isOpen={isOpen} onClick={() => setIsOpen((open) => !open)} />
    </LeftAlignedPanel>
  );
};

const LeftAlignedPanel: React.FC<React.PropsWithChildren<{ isOpen: boolean }>> = ({
  children,
  isOpen,
}) => {
  return (
    <aside
      style={{
        width: isOpen ? PANEL_WIDTH : '0',
        overflowY: 'scroll',
        borderRight: '2px solid var(--color-button-primary)',
        transition: 'width 0.3s ease-in-out',
        paddingTop: '0.5em',
      }}
    >
      {children}
    </aside>
  );
};

const SidePanelToggleButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => {
  return (
    <div className="selector rounded">
      <HoverableButton
        hoverContent={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
        className={isOpen ? 'selected' : ''}
        onClick={onClick}
        style={{
          position: 'fixed',
          top: '50%',
          left: isOpen ? PANEL_WIDTH : '1.5em',
          transform: 'translateX(-50%) translateY(-50%)', // move it to the center of its position
          zIndex: 1000,
          transition: 'left 0.3s ease-in-out',
        }}
        aria-label={isOpen ? 'Close side panel' : 'Open side panel to customize view'}
      >
        <FilterIcon size="1em" display="block" />
      </HoverableButton>
    </div>
  );
};

const SidePanelSection: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        borderBottom: '0.125em solid var(--color-button-primary)',
        width: PANEL_WIDTH,
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

export default SidePanel;
