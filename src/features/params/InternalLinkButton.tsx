import { ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/button';

import { getNewURLSearchParams } from './getNewURLSearchParams';
import { PageParams } from './PageParamTypes';

type Props = React.PropsWithChildren<{
  className?: string;
  page?: LangNavPageName;
  params?: Partial<PageParams>;
  keepOldParams?: boolean;
  newWindow?: boolean;
  variant?: 'outline' | 'secondary' | 'default' | 'ghost' | 'active';
  size?: 'sm' | 'default' | 'lg';
  showWindowIcon?: boolean;
}>;

const InternalLinkButton: React.FC<Props> = ({
  className,
  page = LangNavPageName.Data,
  params,
  children,
  newWindow,
  keepOldParams = false, // Assuming internal link should reset old page parameters by default
  variant = 'outline',
  size = 'sm',
  showWindowIcon = true,
}) => {
  const [oldParams] = useSearchParams({});
  const query = params ? getNewURLSearchParams(params, keepOldParams ? oldParams : undefined) : '';
  const url = useMemo(() => '/' + page + (query ? '?' + query : ''), [query, page]);

  return (
    <Link
      to={url}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      target={newWindow ? '_blank' : undefined}
      rel={newWindow ? 'noopener noreferrer' : undefined}
    >
      {children} {showWindowIcon && (newWindow ? <ArrowUpRightIcon /> : <ArrowRightIcon />)}
    </Link>
  );
};

export default InternalLinkButton;
