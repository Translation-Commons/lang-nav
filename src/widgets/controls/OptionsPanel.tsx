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
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import { AllApplicableFilterSelectors } from '@features/transforms/filtering/selectors/FilterSelector';
import ScaleBySelector from '@features/transforms/scales/ScaleBySelector';
import SearchBySelector from '@features/transforms/search/SearchBySelector';
import SecondarySortBySelector from '@features/transforms/sorting/SecondarySortBySelector';
import SortBySelector from '@features/transforms/sorting/SortBySelector';
import SortDirectionSelector from '@features/transforms/sorting/SortDirectionSelector';

import ResizablePanel from './ResizablePanel';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import PageBrightnessSelector from './selectors/PageBrightnessSelector';
import ProfileSelector from './selectors/ProfileSelector';
import ViewSelector from './selectors/ViewSelector';

import './controls.css';

const OptionsPanel: React.FC = () => {
  usePageArrowKeys();

  return (
    <ResizablePanel defaultWidth={300} purpose="filters" title="Options">
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <OptionsPanelSection title="Filter" optionsName="filters">
          <AllApplicableFilterSelectors />
        </OptionsPanelSection>

        <OptionsPanelSection title="View" optionsName="view options">
          <ViewSelector />
          <LimitInput />
          <SortBySelector />
          <SecondarySortBySelector />
          <SortDirectionSelector />
          <ColorBySelector />
          <ColorGradientSelector />
          <ScaleBySelector />
          <FieldFocusSelector />
          <LocaleSeparatorSelector />
          <PageBrightnessSelector />
          <SearchBySelector />
          <ProfileSelector />
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
