import { FilterIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '../generic/HoverableButton';

import LanguageSchemaSelector from './selectors/LanguageSchemaSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ScopeFilterSelector from './selectors/ScopeFilterSelector';
import SortBySelector from './selectors/SortBySelector';

const SidePanel: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <LeftAlignedPanel isOpen={isOpen}>
      <SidePanelSection title="Data">
        <LanguageSchemaSelector />
      </SidePanelSection>

      <SidePanelSection title="Filters">
        <ScopeFilterSelector />
      </SidePanelSection>

      <SidePanelSection title="View Options">
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
        width: isOpen ? '16em' : '0',
        overflowY: 'auto',
        borderRight: '2px solid var(--color-button-border)',
        transition: 'width 0.3s ease-in-out',
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
          left: isOpen ? '16em' : '1.5em',
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

const SidePanelSection: React.FC<React.PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <div
      style={{
        borderBottom: '0.125em solid var(--color-button-border)',
        width: '16em',
        paddingBottom: '0.5em',
        marginBottom: '0.5em',
      }}
    >
      <div
        style={{
          fontSize: '1.2em',
          fontWeight: 'lighter',
          marginLeft: '0.5em',
          marginTop: '0.25em',
          // textAlign: 'center',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

export default SidePanel;
