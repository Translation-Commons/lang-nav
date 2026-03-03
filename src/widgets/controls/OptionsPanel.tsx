import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageArrowKeys from '@features/pagination/usePageArrowKeys';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import LanguageFilterSelector from '@features/transforms/filtering/LanguageFilterSelector';
import LanguageModalitySelector from '@features/transforms/filtering/LanguageModalitySelector';
import LanguageScopeSelector from '@features/transforms/filtering/LanguageScopeSelector';
import TerritoryFilterSelector from '@features/transforms/filtering/TerritoryFilterSelector';
import TerritoryScopeSelector from '@features/transforms/filtering/TerritoryScopeSelector';
import {
  LanguageISOStatusSelector,
  VitalityEthCoarseSelector,
  VitalityEthFineSelector,
} from '@features/transforms/filtering/VitalitySelector';
import WritingSystemFilterSelector from '@features/transforms/filtering/WritingSystemFilterSelector';

import ResizablePanel from './ResizablePanel';

import './controls.css';

const OptionsPanel: React.FC = () => {
  usePageArrowKeys();

  return (
    <ResizablePanel defaultWidth={300} purpose="filters" title="Filters">
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <OptionsPanelSection optionsName="filters">
          <TerritoryFilterSelector display={SelectorDisplay.ButtonList} />
          <WritingSystemFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageScopeSelector />
          <LanguageModalitySelector />
          <TerritoryScopeSelector />
          <LanguageISOStatusSelector />
          <VitalityEthFineSelector />
          <VitalityEthCoarseSelector />
        </OptionsPanelSection>
      </SelectorDisplayProvider>
    </ResizablePanel>
  );
};

const OptionsPanelSection: React.FC<
  React.PropsWithChildren<{
    optionsName: string;
  }>
> = ({ children, optionsName }) => {
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

export default OptionsPanel;
