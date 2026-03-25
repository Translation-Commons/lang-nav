import { ReactNode } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import LargeLangNavLogo from './LargeLangNavLogo';

type Props = React.PropsWithChildren<{
  title: ReactNode;
  showDocsLink?: boolean;
}>;

function DocsPageContainer({ children, title, showDocsLink = true }: Props) {
  return (
    <main style={{ margin: '2em auto', maxWidth: '800px', textAlign: 'start' }}>
      <div style={{ display: 'flex', gap: '1em', flexDirection: 'column' }}>
        <TitleWithLogo title={title} />
        {showDocsLink && (
          <InternalLink page={LangNavPageName.About}>◀ Documentation Hub</InternalLink>
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
