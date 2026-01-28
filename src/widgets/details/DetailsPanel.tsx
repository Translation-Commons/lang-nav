import React from 'react';

import ResizablePanel from '@widgets/controls/ResizablePanel';
import ObjectPath from '@widgets/pathnav/ObjectPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import usePageParams from '@features/params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ObjectDetails from './ObjectDetails';

const DetailsPanel: React.FC = () => {
  const { objectID, objectType } = usePageParams();
  const object = getObjectFromID(objectID);

  return (
    <ResizablePanel
      purpose="details"
      defaultWidth={600}
      title={
        object ? (
          <>
            <ObjectTitle object={object} highlightSearchMatches={false} />
            <ObjectSubtitle object={object} highlightSearchMatches={false} />
          </>
        ) : (
          objectType + ' Details'
        )
      }
    >
      <DetailsBody>
        <PathContainer style={{ marginTop: '0.5em' }}>
          <ObjectPath />
        </PathContainer>
        {object && <ObjectDetails object={object} />}
        {!object && (
          <>
            In the comparison view, select a {objectType.toLowerCase()} by clicking on its name to
            see more information.
          </>
        )}
      </DetailsBody>
    </ResizablePanel>
  );
};

const DetailsBody: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ padding: '1em' }}>{children}</div>;
};

export default DetailsPanel;
