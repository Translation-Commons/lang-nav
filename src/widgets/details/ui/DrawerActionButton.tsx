import { ArrowUpLeftIcon } from 'lucide-react';
import React from 'react';

import { getViewIcon } from '@widgets/controls/selectors/ViewDisplay';

import { PageParams, View } from '@features/params/PageParamTypes';
import usePageParamNavigation from '@features/params/usePageParamNavigation';

import { Button } from '@shared/ui/button';

const DrawerActionButton: React.FC<{ view: View; baseParams: Partial<PageParams> }> = ({
  view,
  baseParams,
}) => {
  const updatePage = usePageParamNavigation({});
  return (
    <Button variant="outline" size="sm" onClick={() => updatePage({ view, ...baseParams })}>
      <ArrowUpLeftIcon />
      {getViewIcon(view)} {view}
    </Button>
  );
};

export default DrawerActionButton;
