import React, { PropsWithChildren, ReactNode } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import { cn } from '@shared/lib/utils';
import Pill from '@shared/ui/old/Pill';

type Props = {
  title: ReactNode;
  href?: string;
  page?: LangNavPageName;
  isDisabled?: boolean;
};

const DocsCard: React.FC<PropsWithChildren<Props>> = ({
  title,
  href,
  page,
  isDisabled,
  children,
}) => {
  const link = page ? `/${page}` : href;
  const external = href != null && href.startsWith('http');
  const cardClass = cn('flex flex-col gap-2 px-4 py-2', isDisabled && 'opacity-70');

  const body = (
    <>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{title}</span>
        {href != null && isDisabled && <Pill>Coming soon</Pill>}
        {external && !isDisabled ? <span aria-hidden="true">↗</span> : null}
      </div>
      <div className="font-light">{children}</div>
    </>
  );

  if (link == null || isDisabled) {
    return <div className={cardClass}>{body}</div>;
  }
  if (external) {
    return (
      <a
        href={href}
        title={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardClass, 'no-underline')}
      >
        {body}
      </a>
    );
  }

  return (
    <InternalLink page={page} className={cn(cardClass, 'no-underline')}>
      {body}
    </InternalLink>
  );
};

export default DocsCard;
