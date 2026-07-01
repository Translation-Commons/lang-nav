import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageArrowKeys from '@features/pagination/usePageArrowKeys';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import { AllApplicableFilterSelectors } from '@features/transforms/filtering/selectors/FilterSelector';

import ResizablePanel from './ResizablePanel';
import useFilterPanel from './useFilterPanel';

const OptionsPanel: React.FC = () => {
  usePageArrowKeys();

  const filterPanel = useFilterPanel();

  return (
    <ResizablePanel
      defaultWidth={300}
      purpose="filters"
      title="Options"
      isOpen={filterPanel.isOpen}
    >
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <OptionsPanelSection title="Filter" optionsName="filters">
          <AllApplicableFilterSelectors />
        </OptionsPanelSection>
      </SelectorDisplayProvider>
    </ResizablePanel>
  );
};

const OptionsPanelSection: React.FC<
  React.PropsWithChildren<{
    title: string;
    optionsName: string;
  }>
> = ({ children, title, optionsName }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const childArray = React.Children.toArray(children);

  return (
    <div
      style={{
        borderTop: '0.125em solid var(--color-button-primary)',
        width: '100%',
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
        {childArray.length > 1 && (
          <HoverableButton
            style={{ padding: '0em 0.25em' }}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? `close extra ${optionsName} ▲` : `see all ${optionsName} ▶`}
          </HoverableButton>
        )}
      </div>
    </div>
  );
};

export default OptionsPanel;
