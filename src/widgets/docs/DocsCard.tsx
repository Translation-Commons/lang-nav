import React, { PropsWithChildren, ReactNode } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import InternalLink from '@features/params/InternalLink';

import { cn } from '@shared/lib/utils';
import { Badge } from '@shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';

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
  const isLinked = link != null && !isDisabled;

  const card = (
    <Card
      className={cn(
        'h-full',
        isDisabled && 'opacity-72',
        isLinked && 'transition-colors hover:bg-accent',
      )}
      size="sm"
    >
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle>{title}</CardTitle>
        {href != null && isDisabled && <Badge variant="secondary">Coming soon</Badge>}
        {external && !isDisabled ? <span aria-hidden="true">↗</span> : null}
      </CardHeader>
      <CardContent className="font-light">{children}</CardContent>
    </Card>
  );

  if (!isLinked) {
    return card;
  }
  if (external) {
    return (
      <a
        className="no-underline hover:no-underline"
        href={href}
        title={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {card}
      </a>
    );
  }

  return (
    <InternalLink className="no-underline hover:no-underline" page={page}>
      {card}
    </InternalLink>
  );
};

export default DocsCard;
