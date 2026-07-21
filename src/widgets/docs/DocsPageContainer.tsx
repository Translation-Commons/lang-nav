import React, { ReactNode } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import LargeLangNavLogo from './LargeLangNavLogo';

type Props = React.PropsWithChildren<{
  title: ReactNode;
  showDocsLink?: boolean;
}>;

function DocsPageContainer({ children, title, showDocsLink = true }: Props) {
  return (
    <main className="mx-auto my-8 max-w-[800px] text-start">
      <div className="flex flex-col gap-4">
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
    <div className="mb-1 flex items-center gap-2 p-1 text-[2em]">
      <LargeLangNavLogo />
      <span>{title}</span>
    </div>
  );
}

export default DocsPageContainer;
