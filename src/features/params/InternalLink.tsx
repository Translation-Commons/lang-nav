import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParams } from './PageParamTypes';

type Props = {
  page?: LangNavPageName;
  params?: Partial<PageParams>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  keepOldParams?: boolean;
};

const InternalLink: React.FC<Props> = ({
  page = LangNavPageName.Data,
  params,
  children,
  className,
  style,
  keepOldParams = false, // Assuming internal link should reset old page parameters by default
}) => {
  const [oldParams] = useSearchParams({});
  const paramsStr = params
    ? '?' + getNewURLSearchParams(params, keepOldParams ? oldParams : undefined)
    : '';
  const to = ['/', page, paramsStr].join('');
  return (
    <Link to={to} title={to} className={className} style={style}>
      {children}
    </Link>
  );
};

export default InternalLink;
