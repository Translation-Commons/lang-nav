import React from 'react';

import DocsCard from '@widgets/docs/DocsCard';
import DocsSection from '@widgets/docs/DocsSection';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import InternalLink from '@features/params/InternalLink';

import ExternalLink from '@shared/ui/old/ExternalLink';
import LinkButton from '@shared/ui/old/LinkButton';

const codeClass = 'rounded bg-secondary px-1 py-0.5';

const LinkComponents: React.FC = () => {
  return (
    <DocsSection title="Links">
      <div>
        Links should be clear but not overly styled. Thereby, they should only have underlines on
        hover. They should follow the regular text color but stand out using font-weight.
      </div>
      <DocsCard title="External Links">
        External links should always open in a new tab. They should include{' '}
        <code className={codeClass}>rel=&quot;noopener noreferrer&quot;</code> for security and
        performance reasons. They should be accompanied by an appropriate visual indicator to inform
        users that the link will open in a new tab. Buttons are slightly preferred to give clear
        visual indicators of an interaction.
      </DocsCard>
      <DocsCard title="Internal Links">
        Internal links should use the <code className={codeClass}>&lt;InternalLink&gt;</code>{' '}
        component that uses <code className={codeClass}>&lt;Link&gt;</code> from react-router-dom.
        This enables client-side navigation without full page reloads.
      </DocsCard>
      <DocsCard title="Hoverables">
        Components that show a card or other additional context on hover should use the{' '}
        <code className={codeClass}>&lt;Hoverable&gt;</code> or{' '}
        <code className={codeClass}>&lt;HoverableButton&gt;</code> component. These components
        provide a consistent hover experience and can be easily styled to fit the design of the
        site. They have <code className={codeClass}>onClick</code> handlers for interactive
        behavior. Unlike most links, inline hoverables are colored by default.
      </DocsCard>
      <DocsCard title="Page Parameter Updates">
        When updating page parameters, you can use the{' '}
        <code className={codeClass}>updatePageParams</code> function in{' '}
        <code className={codeClass}>onClick</code> events. Sometimes though it may be good to use{' '}
        <code className={codeClass}>&lt;InternalLink&gt;</code> components to allow users to open in
        new tabs or copy links.
      </DocsCard>
      <DocsCard title="Component examples">
        <table className="table-fixed">
          <tbody>
            <tr>
              <td className="font-mono">&lt;ExternalLink&gt;</td>
              <td>
                <ExternalLink href="https://example.com">I&apos;m a link</ExternalLink>
              </td>
            </tr>
            <tr>
              <td className="font-mono">&lt;InternalLink&gt;</td>
              <td>
                <InternalLink>I&apos;m a link</InternalLink>
              </td>
            </tr>
            <tr>
              <td className="font-mono">&lt;Hoverable&gt;</td>
              <td>
                <Hoverable hoverContent="I show on hover" onClick={() => alert('Clicked!')}>
                  I&apos;m hoverable and clickable
                </Hoverable>
              </td>
            </tr>
            <tr>
              <td className="font-mono">&lt;LinkButton&gt;</td>
              <td>
                <LinkButton href="https://example.com">I&apos;m a link</LinkButton>
              </td>
            </tr>
            <tr>
              <td className="font-mono">&lt;HoverableButton&gt;</td>
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
  );
};

export default LinkComponents;
