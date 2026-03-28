import React from 'react';

import PageBrightnessSelector from '@widgets/controls/selectors/PageBrightnessSelector';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';

import ColorSwatch from './ColorSwatch';
import DocsCard from './DocsCard';
import DocsSection from './DocsSection';

const ColorStyles: React.FC = () => {
  return (
    <DocsSection title="Colors">
      <div>
        Use CSS variables for colors to maintain consistency and make it easy to update the color
        scheme across the site. Colors should be chosen to ensure sufficient contrast for
        readability and accessibility. These colors adapt to the page brightness setting:
        <div style={{ display: 'inline-block' }}>
          <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
            <PageBrightnessSelector />
          </SelectorDisplayProvider>
        </div>
      </div>
      <DocsCard title="Text">
        <SwatchesGrid>
          <ColorSwatch variable="--color-text" description="For most text and primary content" />
          <ColorSwatch
            variable="--color-text-secondary"
            description="For less important content, for instance to de-emphasize certain text so that the main text stands out more"
          />
          <ColorSwatch
            variable="--color-text-on-color"
            description="For text shown on colored backgrounds, such as buttons or colored hoverables"
          />
          <ColorSwatch
            variable="--color-text-highlight"
            description="To highlight the background of text like when searching"
          />
        </SwatchesGrid>
      </DocsCard>
      <DocsCard title="Buttons">
        <SwatchesGrid>
          <ColorSwatch
            variable="--color-button-primary"
            description="Bright, clickable call to actions. Also used to show selected values or some headers"
          />
          <ColorSwatch
            variable="--color-button-hover"
            description="Buttons when hovered over or active"
          />
          <ColorSwatch variable="--color-button-secondary" description="Less important buttons" />
        </SwatchesGrid>
      </DocsCard>
      <DocsCard title="Other">
        <SwatchesGrid>
          <ColorSwatch variable="--color-background" description="Most component backgrounds" />
          <ColorSwatch
            variable="--color-background-hover"
            description="Minor background effect for hovers where there could be interactive elements so you do not want it as deep as button-primary"
          />
          <ColorSwatch variable="--color-shadow" description="Shadow around a component" />
        </SwatchesGrid>
      </DocsCard>
      <DocsCard title="Semantic Colors">
        <SwatchesGrid>
          <ColorSwatch variable="--color-red" description="bad or errors" />
          <ColorSwatch variable="--color-orange" description="high" />
          <ColorSwatch variable="--color-yellow" description="warning or caution" />
          <ColorSwatch variable="--color-purple" description="special" />
          <ColorSwatch variable="--color-blue" description="low" />
          <ColorSwatch variable="--color-green" description="good or success" />
        </SwatchesGrid>
      </DocsCard>
    </DocsSection>
  );
};

const SwatchesGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
        gap: '0.5em',
      }}
    >
      {children}
    </div>
  );
};

export default ColorStyles;
