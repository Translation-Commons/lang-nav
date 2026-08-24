import React from 'react';

import ResizablePanel from '@widgets/controls/ResizablePanel';
import ObjectPath from '@widgets/pathnav/ObjectPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import usePageParams from '@features/params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { EntityData } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const ObjectDetails = React.lazy(() => import('../ObjectDetails'));

const DetailsPanel: React.FC = () => {
  const { entID, entityType, updatePageParams } = usePageParams();
  const ent = getObjectFromID(entID);

  return (
    <ResizablePanel
      purpose="details"
      isOpen={entID != null}
      defaultWidth={900}
      title={<DetailsTitle ent={ent} />}
      onClose={() => updatePageParams({ entID: undefined })}
    >
      <DetailsBody>
        <PathContainer style={{ marginTop: '0.5em' }}>
          <ObjectPath ent={ent} />
        </PathContainer>
        <ContainErrorsAndSuspense>{ent && <ObjectDetails ent={ent} />}</ContainErrorsAndSuspense>
        {!ent && (
          <>
            In the comparison view, select a {entityType.toLowerCase()} by clicking on its name to
            see more information.
          </>
        )}
      </DetailsBody>
    </ResizablePanel>
  );
};

const DetailsTitle: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (!ent) return 'Details';
  return (
    <div>
      <ObjectTitle ent={ent} highlightSearchMatches={false} />
      <ObjectSubtitle ent={ent} highlightSearchMatches={false} />
    </div>
  );
};

const DetailsBody: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ padding: '1em' }}>{children}</div>;
};

export default DetailsPanel;
