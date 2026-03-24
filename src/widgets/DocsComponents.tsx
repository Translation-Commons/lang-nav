import React, { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { usePageBrightness } from '@shared/hooks/usePageBrightness';
import Pill from '@shared/ui/Pill';

export function PageContainer({ children, title }: { children: ReactNode; title: string }) {
  const isCurrentPageDocs = window.location.pathname.includes('/docs');

  return (
    <main style={{ margin: '2em auto', maxWidth: '800px', textAlign: 'start' }}>
      <LangNavTitle title={title} />
      {!isCurrentPageDocs && <Link to="/docs">◀ Documentation Hub</Link>}
      {children}
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      id={title.toLowerCase().replace(/\s+/g, '-')}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', marginBottom: '2em' }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function LangNavTitle({ title }: { title?: string }) {
  const { pageBrightness } = usePageBrightness();

  return (
    <div
      className="logo"
      style={{
        alignItems: 'center',
        display: 'flex',
        fontSize: '2em',
        padding: '0.25em',
        marginBottom: '0.25em',
        gap: '0.5em',
      }}
    >
      <img
        src={`/lang-nav/logo/LangNavLogo${pageBrightness === 'dark' ? 'Dark' : ''}.svg`}
        width="120px"
        height="60px"
        alt="LangNav Logo"
      />
      <span>
        <strong>Lang</strong>uage <strong>Nav</strong>igator: {title}
      </span>
    </div>
  );
}

type DocCardProps = {
  title: string;
  href?: string;
  isDisabled?: boolean;
};

export const DocCard: React.FC<PropsWithChildren<DocCardProps>> = ({
  title,
  href,
  isDisabled,
  children,
}) => {
  const external = href != null && href.startsWith('http');
  const cardStyle: React.CSSProperties = {
    padding: '0.5em 1em',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5em',
    opacity: isDisabled ? 0.72 : 1,
  };

  const body = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        {href != null && isDisabled && <Pill>Coming soon</Pill>}
        {external && !isDisabled ? <span aria-hidden="true">↗</span> : null}
      </div>
      <p style={{ margin: 0, fontWeight: 'lighter' }}>{children}</p>
    </>
  );

  if (href == null || isDisabled) {
    return <div style={cardStyle}>{body}</div>;
  }
  if (external) {
    return (
      <a
        href={href}
        title={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...cardStyle, textDecoration: 'none' }}
      >
        {body}
      </a>
    );
  }

  return (
    <Link to={href} title={href} style={{ ...cardStyle, textDecoration: 'none' }}>
      {body}
    </Link>
  );
};

export const DocsCardGrid: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '-0.5em 0',
      }}
    >
      {children}
    </div>
  );
};
