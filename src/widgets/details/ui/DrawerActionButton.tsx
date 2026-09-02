import React from 'react';

import { getViewIcon, getViewLabel } from '@widgets/controls/selectors/ViewDisplay';

import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParamNavigation from '@features/params/usePageParamNavigation';

import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

const DrawerActionButton: React.FC<{ view: View; baseParams: Partial<PageParams> }> = ({
  view,
  baseParams,
}) => {
  const updatePage = usePageParamNavigation({});
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        render={
          <Button variant="ghost" size="sm" onClick={() => updatePage({ view, ...baseParams })}>
            {getViewIcon(view)}
          </Button>
        }
      />
      <HoverCardContent className="w-fit">
        {getViewLabel(view)} of{' '}
        {baseParams.entType === EntityType.Language ? 'dialects' : 'territories with this language'}
      </HoverCardContent>
    </HoverCard>
  );
};

export default DrawerActionButton;
