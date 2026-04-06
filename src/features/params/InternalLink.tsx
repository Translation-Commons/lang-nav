import React from 'react';
import { Link } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParamsOptional } from './PageParamTypes';

type Props = {
  page?: LangNavPageName;
  params?: PageParamsOptional;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const InternalLink: React.FC<Props> = ({
  page = LangNavPageName.Data,
  params,
  children,
  style,
}) => {
  const to = ['/', page, params && `?${getNewURLSearchParams(params)}`].filter(Boolean).join('');
  return (
    <Link to={to} title={to} style={style}>
      {children}
    </Link>
  );
};

export default InternalLink;
