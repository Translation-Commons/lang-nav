import DocsCard from '@widgets/docs/DocsCard';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import DocsSection from '@widgets/docs/DocsSection';

import InternalLink from '@features/params/InternalLink';

import ExternalLink from '@shared/ui/ExternalLink';
import LinkButton from '@shared/ui/LinkButton';

const CodeStylePage: React.FC = () => {
  return (
    <DocsPageContainer title="Code Style">
      <div>This page outlines the code style guidelines for the Language Navigator project.</div>
      <DocsSection title="Links">
        Generally, we do not underline links or use the blue/purple coloring.
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
          without full page reloads. You should pass in the page name and optionally page params
          from <code>PageParamsOptional</code>. Often page parameters may be changed using{' '}
          <code>onClick</code> events like:{' '}
          <code>
            updatePageParams({'{'}...{'}'})
          </code>{' '}
          -- this works in most cases, but in some cases it may be better to generate a full URL
          hyperreference so users can right-click to copy the link or open in a new tab.
        </DocsCard>
        <DocsCard title="Component examples">
          <ul style={{ margin: 0 }}>
            <li>
              <code>&lt;LinkButton&gt;</code>:
              <LinkButton href="https://example.com">I&apos;m a link</LinkButton>
            </li>
            <li>
              <code>&lt;ExternalLink&gt;</code>:{' '}
              <ExternalLink href="https://example.com">I&apos;m a link</ExternalLink>
            </li>
            <li>
              <code>&lt;InternalLink&gt;</code>: <InternalLink>I&apos;m a link</InternalLink>
            </li>
          </ul>
        </DocsCard>
      </DocsSection>
    </DocsPageContainer>
  );
};

export default CodeStylePage;
