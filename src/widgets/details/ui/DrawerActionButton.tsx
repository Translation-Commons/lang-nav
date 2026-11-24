import React from 'react';

import { getViewIcon } from '@widgets/controls/selectors/ViewDisplay';

import InternalLinkButton from '@features/params/InternalLinkButton';
import { PageParams, View } from '@features/params/PageParamTypes';

const DrawerActionButton: React.FC<{ view: View; baseParams: Partial<PageParams> }> = ({
  view,
  baseParams,
}) => {
  return (
    <InternalLinkButton params={{ ...baseParams, view }}>
      {getViewIcon(view)} {view}
    </InternalLinkButton>
  );
};

export default DrawerActionButton;
