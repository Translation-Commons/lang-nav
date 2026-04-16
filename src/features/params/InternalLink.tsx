import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParamsOptional } from './PageParamTypes';

type Props = {
  page?: LangNavPageName;
  params?: PageParamsOptional;
  children: React.ReactNode;
  style?: React.CSSProperties;
  keepOldParams?: boolean;
};

const InternalLink: React.FC<Props> = ({
  page = LangNavPageName.Data,
  params,
  children,
  style,
  keepOldParams = false, // Assuming internal link should reset old page parameters by default
}) => {
  const [oldParams] = useSearchParams({});
  const paramsStr = params
    ? '?' + getNewURLSearchParams(params, keepOldParams ? oldParams : undefined)
    : '';
  const to = ['/', page, paramsStr].join('');
  return (
    <Link to={to} title={to} style={style}>
      {children}
    </Link>
  );
};

export default InternalLink;
