import React from 'react';

import ResizablePanel from '@widgets/controls/ResizablePanel';
import EntityPath from '@widgets/pathnav/EntityPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import usePageParams from '@features/params/usePageParams';

import getEntityFromID from '@entities/lib/getEntityFromID';
import { EntityData } from '@entities/types/DataTypes';
import EntitySubtitle from '@entities/ui/EntitySubtitle';
import EntityTitle from '@entities/ui/EntityTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const EntityDetailsBody = React.lazy(() => import('../EntityDetailsBody'));

const DetailsPanel: React.FC = () => {
  const { entID, entType, updatePageParams } = usePageParams();
  const ent = getEntityFromID(entID);

  return (
    <ResizablePanel
      purpose="details"
      isOpen={entID != null}
      defaultWidth={900}
      title={<DetailsTitle ent={ent} />}
      onClose={() => updatePageParams({ entID: undefined })}
    >
      <DetailsBody>
        <PathContainer className="mb-2">
          <EntityPath ent={ent} />
        </PathContainer>
        <ContainErrorsAndSuspense>
          {ent && <EntityDetailsBody ent={ent} />}
        </ContainErrorsAndSuspense>
        {!ent && (
          <>
            In the comparison view, select a {entType.toLowerCase()} by clicking on its name to see
            more information.
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
      <EntityTitle ent={ent} highlightSearchMatches={false} />
      <EntitySubtitle ent={ent} highlightSearchMatches={false} />
    </div>
  );
};

const DetailsBody: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ padding: '1em' }}>{children}</div>;
};

export default DetailsPanel;
