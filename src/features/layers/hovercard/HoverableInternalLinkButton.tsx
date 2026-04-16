import React, { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { PageParamsOptional } from '@features/params/PageParamTypes';

import useHoverCard from './useHoverCard';

type HoverableProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  hoverContent?: React.ReactNode;
  keepOldParams?: boolean;
  onClick?: () => void;
  page?: LangNavPageName;
  params?: PageParamsOptional;
  role?: string;
  style?: React.CSSProperties;
};

const HoverableInternalLinkButton: React.FC<HoverableProps> = ({
  children,
  className,
  hoverContent,
  onClick,
  params,
  page = LangNavPageName.Data,
  keepOldParams = false,
  style,
}) => {
  const { showHoverCard, hideHoverCard } = useHoverCard();
  const [oldParams] = useSearchParams({});

  // Get the internal link
  const paramsStr = params
    ? '?' + getNewURLSearchParams(params, keepOldParams ? oldParams : undefined)
    : '';
  const to = ['/', page, paramsStr].join('');

  // Events
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => hoverContent && showHoverCard(hoverContent, e.clientX, e.clientY),
    [hoverContent, to],
  );
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => hoverContent && showHoverCard(hoverContent, e.clientX, e.clientY),
    [hoverContent, to],
  );

  return (
    <Link
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={hideHoverCard}
      onClick={() => {
        hideHoverCard();
        if (onClick != null) onClick();
      }}
      style={{ cursor: 'pointer', textDecoration: 'none', ...style }}
      to={to}
    >
      {children}
    </Link>
  );
};

export default HoverableInternalLinkButton;
