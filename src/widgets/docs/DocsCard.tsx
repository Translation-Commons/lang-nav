import React, { PropsWithChildren, ReactNode } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import Pill from '@shared/ui/Pill';

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

  if (link == null || isDisabled) {
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
    <InternalLink page={page} style={{ ...cardStyle, textDecoration: 'none' }}>
      {body}
    </InternalLink>
  );
};

export default DocsCard;
