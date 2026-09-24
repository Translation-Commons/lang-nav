import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParams } from './PageParamTypes';

type Props = React.PropsWithChildren<{
  className?: string;
  page?: LangNavPageName;
  params?: Partial<PageParams>;
  style?: React.CSSProperties;
  keepOldParams?: boolean;
  newWindow?: boolean;
}>;

const InternalLink: React.FC<Props> = ({
  className,
  page = LangNavPageName.Data,
  params,
  children,
  style,
  newWindow,
  keepOldParams = false, // Assuming internal link should reset old page parameters by default
}) => {
  const [oldParams] = useSearchParams({});
  const paramsStr = params
    ? '?' + getNewURLSearchParams(params, keepOldParams ? oldParams : undefined)
    : '';
  const to = ['/', page, paramsStr].join('');
  return (
    <Link
      className={className}
      to={to}
      title={to}
      style={style}
      target={newWindow ? '_blank' : undefined}
      rel={newWindow ? 'noopener noreferrer' : undefined}
    >
      {children}
    </Link>
  );
};

export default InternalLink;
