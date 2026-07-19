import React from 'react';

import ResizablePanel from '@widgets/controls/ResizablePanel';
import ObjectPath from '@widgets/pathnav/ObjectPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import usePageParams from '@features/params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const ObjectDetails = React.lazy(() => import('./ObjectDetails'));

const DetailsPanel: React.FC = () => {
  const { objectID, objectType, updatePageParams } = usePageParams();
  const object = getObjectFromID(objectID);

  return (
    <ResizablePanel
      purpose="details"
      isOpen={objectID != null}
      defaultWidth={900}
      title={<DetailsTitle object={object} />}
      onClose={() => updatePageParams({ objectID: undefined })}
    >
      <div className="flex flex-col gap-2">
        <PathContainer>
          <ObjectPath object={object} />
        </PathContainer>
        <ContainErrorsAndSuspense>
          {object && <ObjectDetails object={object} />}
        </ContainErrorsAndSuspense>
        {!object && (
          <p className="text-muted-foreground">
            In the comparison view, select a {objectType.toLowerCase()} by clicking on its name to
            see more information.
          </p>
        )}
      </div>
    </ResizablePanel>
  );
};

const DetailsTitle: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (!object) return 'Details';
  return (
    <div>
      <ObjectTitle object={object} highlightSearchMatches={false} />
      <ObjectSubtitle object={object} highlightSearchMatches={false} />
    </div>
  );
};

export default DetailsPanel;
