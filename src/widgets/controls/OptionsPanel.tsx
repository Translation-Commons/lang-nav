import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import LimitInput from '@features/pagination/LimitInput';
import usePageArrowKeys from '@features/pagination/usePageArrowKeys';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import LanguageFilterSelector from '@features/transforms/filtering/LanguageFilterSelector';
import LanguageModalitySelector from '@features/transforms/filtering/LanguageModalitySelector';
import LanguageScopeSelector from '@features/transforms/filtering/LanguageScopeSelector';
import TerritoryFilterSelector from '@features/transforms/filtering/TerritoryFilterSelector';
import TerritoryScopeSelector from '@features/transforms/filtering/TerritoryScopeSelector';
import {
  LanguageISOStatusSelector,
  VitalityEth2013Selector,
  VitalityEth2025Selector,
} from '@features/transforms/filtering/VitalitySelector';
import WritingSystemFilterSelector from '@features/transforms/filtering/WritingSystemFilterSelector';
import ScaleBySelector from '@features/transforms/scales/ScaleBySelector';
import SortBySelector from '@features/transforms/sorting/SortBySelector';
import SortDirectionSelector from '@features/transforms/sorting/SortDirectionSelector';

import { ObjectiveList } from '../CommonObjectives';

import ResizablePanel from './ResizablePanel';
import LanguageSourceSelector from './selectors/LanguageSourceSelector';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ObjectTypeSelector from './selectors/ObjectTypeSelector';
import PageBrightnessSelector from './selectors/PageBrightnessSelector';
import ProfileSelector from './selectors/ProfileSelector';
import ViewSelector from './selectors/ViewSelector';

import './controls.css';

const OptionsPanel: React.FC = () => {
  usePageArrowKeys();

  return (
    <ResizablePanel defaultWidth={300} purpose="filters" title="Options">
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <OptionsPanelSection title="Common Actions" optionsName="common actions">
          <div>{/* intentionally blank */}</div>
          <ObjectiveList />
        </OptionsPanelSection>

        <OptionsPanelSection title="Data" optionsName="data options">
          <ObjectTypeSelector />
          <LanguageSourceSelector display={SelectorDisplay.ButtonList} />
          <ProfileSelector />
        </OptionsPanelSection>

        <OptionsPanelSection title="Filter" optionsName="filters">
          <TerritoryFilterSelector display={SelectorDisplay.ButtonList} />
          <WritingSystemFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageFilterSelector display={SelectorDisplay.ButtonList} />
          <LanguageScopeSelector />
          <LanguageModalitySelector />
          <TerritoryScopeSelector />
          <LanguageISOStatusSelector />
          <VitalityEth2013Selector />
          <VitalityEth2025Selector />
        </OptionsPanelSection>

        <OptionsPanelSection title="View" optionsName="view options">
          <ViewSelector />
          <LimitInput />
          <SortBySelector />
          <SortDirectionSelector />
          <ColorBySelector />
          <ScaleBySelector />
          <ColorGradientSelector />
          <LocaleSeparatorSelector />
          <PageBrightnessSelector />
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
