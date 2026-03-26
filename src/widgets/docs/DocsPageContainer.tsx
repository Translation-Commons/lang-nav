import { ReactNode } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import LargeLangNavLogo from './LargeLangNavLogo';

function DocsPageContainer({ children, title }: { children: ReactNode; title: ReactNode }) {
  const isCurrentPageDocs = window.location.pathname.includes('/docs');

  return (
    <main style={{ margin: '2em auto', maxWidth: '800px', textAlign: 'start' }}>
      <div style={{ display: 'flex', gap: '1em', flexDirection: 'column' }}>
        <TitleWithLogo title={title} />
        {!isCurrentPageDocs && (
          <InternalLink page={LangNavPageName.Docs}>◀ Documentation Hub</InternalLink>
        )}
        {children}
      </div>
    </main>
  );
}

function TitleWithLogo({ title }: { title?: ReactNode }) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        fontSize: '2em',
        padding: '0.25em',
        marginBottom: '0.25em',
        gap: '0.5em',
      }}
    >
      <LargeLangNavLogo />
      <span>{title}</span>
    </div>
  );
}

export default DocsPageContainer;
