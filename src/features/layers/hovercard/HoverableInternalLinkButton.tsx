import React from 'react';
import { Link, useSearchParams } from 'react-router';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParams } from '@features/params/PageParamTypes';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type HoverableProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hoverContent?: React.ReactNode;
  keepOldParams?: boolean;
  onClick?: () => void;
  onMouseDown?: () => void;
  page?: LangNavPageName;
  params?: Partial<PageParams>;
  role?: string;
  style?: React.CSSProperties;
};

const HoverableInternalLinkButton: React.FC<HoverableProps> = ({
  children,
  className,
  hoverContent,
  onClick,
  onMouseDown,
  params,
  page = LangNavPageName.Data,
  keepOldParams = false,
  style,
}) => {
  const [oldParams] = useSearchParams({});

  const paramsStr = params
    ? '?' + getNewURLSearchParams(params, keepOldParams ? oldParams : undefined)
    : '';
  const to = ['/', page, paramsStr].join('');

  const link = (
    <Link
      className={className}
      onMouseDown={onMouseDown}
      onClick={() => onClick?.()}
      style={{ cursor: 'pointer', textDecoration: 'none', ...style }}
      to={to}
    >
      {children}
    </Link>
  );

  if (hoverContent == null) {
    return link;
  }

  return (
    <HoverCard>
      <HoverCardTrigger render={link} />
      <HoverCardContent className="w-auto max-w-96">{hoverContent}</HoverCardContent>
    </HoverCard>
  );
};

export default HoverableInternalLinkButton;
