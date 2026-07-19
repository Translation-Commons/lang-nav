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
        Use the design system color tokens to maintain consistency and make it easy to update the
        color scheme across the site. Colors should be chosen to ensure sufficient contrast for
        readability and accessibility. These colors adapt to the page brightness setting:
        <div className="inline-block">
          <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
            <PageBrightnessSelector />
          </SelectorDisplayProvider>
        </div>
      </div>
      <DocsCard title="Surfaces">
        <SwatchesGrid>
          <ColorSwatch
            variable="--background"
            description="Default page and component background"
          />
          <ColorSwatch variable="--foreground" description="Default text and primary content" />
          <ColorSwatch variable="--border" description="Borders and dividers between elements" />
        </SwatchesGrid>
      </DocsCard>
      <DocsCard title="Actions">
        <SwatchesGrid>
          <ColorSwatch
            variable="--primary"
            description="Bright, clickable call to actions and selected values"
          />
          <ColorSwatch variable="--secondary" description="Less prominent buttons and badges" />
          <ColorSwatch variable="--accent" description="Subtle hover and active surfaces" />
          <ColorSwatch variable="--muted" description="Muted backgrounds for secondary content" />
          <ColorSwatch variable="--destructive" description="Errors and destructive actions" />
        </SwatchesGrid>
      </DocsCard>
      <DocsCard title="Categorical">
        <SwatchesGrid>
          <ColorSwatch variable="--color-red" description="bad or errors" />
          <ColorSwatch variable="--color-orange" description="high" />
          <ColorSwatch variable="--color-yellow" description="warning or caution" />
          <ColorSwatch variable="--color-green" description="good or success" />
          <ColorSwatch variable="--color-blue" description="low" />
          <ColorSwatch variable="--color-purple" description="special" />
        </SwatchesGrid>
      </DocsCard>
    </DocsSection>
  );
};

const SwatchesGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
};

export default ColorStyles;
