import React from 'react';

import PageBrightnessSelector from '@widgets/controls/selectors/PageBrightnessSelector';
import ColorSwatch from '@widgets/docs/ColorSwatch';
import DocsCard from '@widgets/docs/DocsCard';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import InternalLink from '@features/params/InternalLink';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';

import ExternalLink from '@shared/ui/ExternalLink';
import LinkButton from '@shared/ui/LinkButton';

const CodeStylePage: React.FC = () => {
  return (
    <DocsPageContainer title="Code Style">
      <div>This page outlines the code style guidelines for the Language Navigator project.</div>
      <DocsSection title="Links">
        <div>
          Links should be clear but not overly styled. Thereby, they should only have underlines on
          hover. They should follow the regular text color but stand out using font-weight.
        </div>
        <DocsCard title="External Links">
          External links should always open in a new tab. They should include{' '}
          <code>rel=&quot;noopener noreferrer&quot;</code> for security and performance reasons.
          They should be accompanied by an appropriate visual indicator to inform users that the
          link will open in a new tab. Buttons are slightly preferred to give clear visual
          indicators of an interaction.
        </DocsCard>
        <DocsCard title="Internal Links">
          Internal links should use the <code>&lt;InternalLink&gt;</code> component that uses{' '}
          <code>&lt;Link&gt;</code> from react-router-dom. This enables client-side navigation
          without full page reloads.
        </DocsCard>
        <DocsCard title="Hoverables">
          Components that show a card or other additional context on hover should use the{' '}
          <code>&lt;Hoverable&gt;</code> or <code>&lt;HoverableButton&gt;</code> component. These
          components provide a consistent hover experience and can be easily styled to fit the
          design of the site. They have <code>onClick</code> handlers for interactive behavior.
          Unlike most links, inline hoverables are colored by default.
        </DocsCard>
        <DocsCard title="Page Parameter Updates">
          When updating page parameters, you can use the <code>updatePageParams</code> function in{' '}
          <code>onClick</code> events. Sometimes though it may be good to use{' '}
          <code>&lt;InternalLink&gt;</code> components to allow users to open in new tabs or copy
          links.
        </DocsCard>
        <DocsCard title="Component examples">
          <table style={{ tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>&lt;ExternalLink&gt;</td>
                <td>
                  <ExternalLink href="https://example.com">I&apos;m a link</ExternalLink>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>&lt;InternalLink&gt;</td>
                <td>
                  <InternalLink>I&apos;m a link</InternalLink>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>&lt;Hoverable&gt;</td>
                <td>
                  <Hoverable hoverContent="I show on hover" onClick={() => alert('Clicked!')}>
                    I&apos;m hoverable and clickable
                  </Hoverable>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>&lt;LinkButton&gt;</td>
                <td>
                  <LinkButton href="https://example.com">I&apos;m a link</LinkButton>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>&lt;HoverableButton&gt;</td>
                <td>
                  <HoverableButton hoverContent="I show on hover" onClick={() => alert('Clicked!')}>
                    I&apos;m hoverable and clickable
                  </HoverableButton>
                </td>
              </tr>
            </tbody>
          </table>
        </DocsCard>
      </DocsSection>
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
              variable="--color-text-highlight"
              description="To highlight the background of text like when searching"
            />
            <ColorSwatch
              variable="--color-text-on-color"
              description="For text shown on colored backgrounds, such as buttons or colored hoverables"
            />
          </SwatchesGrid>
        </DocsCard>
        <DocsCard title="Buttons">
          <SwatchesGrid>
            <ColorSwatch
              variable="--color-button-primary"
              description="Bright, clickable primary action"
            />
            <ColorSwatch variable="--color-button-secondary" description="Less important buttons" />
            <ColorSwatch
              variable="--color-button-hover"
              description="All buttons, when hovered over or active"
            />
          </SwatchesGrid>
        </DocsCard>
        <DocsCard title="Other">
          <SwatchesGrid>
            <ColorSwatch variable="--color-background" description="Most component backgrounds" />
            <ColorSwatch
              variable="--color-background-hover"
              description="Light background effect for hovers where there could be interactive elements so you do not want it as deep as button-primary"
            />
            <ColorSwatch variable="--color-shadow" description="Shadow around a component" />
          </SwatchesGrid>
        </DocsCard>
        <DocsCard title="Semantic Colors">
          Use semantic colors (e.g., red for errors, green for success) to convey meaning through
          color.
          <SwatchesGrid>
            <ColorSwatch variable="--color-text-red" />
            <ColorSwatch variable="--color-text-orange" />
            <ColorSwatch variable="--color-text-yellow" />
            <ColorSwatch variable="--color-text-purple" />
            <ColorSwatch variable="--color-text-blue" />
            <ColorSwatch variable="--color-text-green" />
          </SwatchesGrid>
        </DocsCard>
      </DocsSection>
    </DocsPageContainer>
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

export default CodeStylePage;
