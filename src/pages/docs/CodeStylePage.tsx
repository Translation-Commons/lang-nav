import React from 'react';

import ColorStyles from '@widgets/docs/ColorStyles';
import DocsPageContainer from '@widgets/docs/DocsPageContainer';
import LayerComponents from '@widgets/docs/LayerComponents';
import LinkComponents from '@widgets/docs/LinkComponents';

const CodeStylePage: React.FC = () => {
  return (
    <DocsPageContainer title="Code Style">
      <div>This page outlines the code style guidelines for the Language Navigator project.</div>
      <LinkComponents />
      <LayerComponents />
      <ColorStyles />
    </DocsPageContainer>
  );
};

export default CodeStylePage;
