import { ArrowUpLeftIcon } from 'lucide-react';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { getViewIcon } from '@widgets/controls/selectors/ViewDisplay';

import { getDataPageURL } from '@features/params/getDataPageURL';
import { PageParams, View } from '@features/params/PageParamTypes';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/button';

const DrawerActionButton: React.FC<{ view: View; baseParams: Partial<PageParams> }> = ({
  view,
  baseParams,
}) => {
  const [oldParams] = useSearchParams({});
  return (
    <Link
      to={getDataPageURL({ ...oldParams, ...baseParams, view })}
      data-slot="button"
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
    >
      <ArrowUpLeftIcon />
      {getViewIcon(view)} {view}
    </Link>
  );
  // return (
  //   <Button
  //     nativeButton={false}
  //     role="link"
  //     variant="outline"
  //     size="sm"
  //     render={
  //       <a href={href} title={view}>
  //         <ArrowUpLeftIcon />
  //         {getViewIcon(view)} {view}
  //       </a>
  //     }
  //   />
  // );
};

export default DrawerActionButton;
