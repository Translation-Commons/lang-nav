import { XIcon } from 'lucide-react';
import React from 'react';

import ResizablePanel from '@widgets/controls/ResizablePanel';
import ObjectPath from '@widgets/pathnav/ObjectPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const ObjectDetails = React.lazy(() => import('./ObjectDetails'));

const DetailsPanel: React.FC = () => {
  const { objectID, objectType } = usePageParams();
  const object = getObjectFromID(objectID);

  return (
    <ResizablePanel
      purpose="details"
      isOpen={objectID != null}
      defaultWidth={600}
      title={<DetailsTitle object={object} />}
    >
      <DetailsBody>
        <PathContainer style={{ marginTop: '0.5em' }}>
          <ObjectPath object={object} />
        </PathContainer>
        <ContainErrorsAndSuspense>
          {object && <ObjectDetails object={object} />}
        </ContainErrorsAndSuspense>
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

const DetailsTitle: React.FC<{ object?: ObjectData }> = ({ object }) => {
  const { updatePageParams } = usePageParams();
  return (
    <div
      style={{ display: 'flex', alignItems: 'start', gap: '1em', justifyContent: 'space-between' }}
    >
      <div style={{ padding: '0.125em' }}>
        {/* Invisible but here to balance the padding for the title */}
        <XIcon size="1em" style={{ color: 'var(--color-background)' }} />
      </div>
      {object ? (
        <div>
          <ObjectTitle object={object} highlightSearchMatches={false} />
          <ObjectSubtitle object={object} highlightSearchMatches={false} />
        </div>
      ) : (
        'Details'
      )}
      <HoverableButton
        className="primary"
        hoverContent="Close"
        onClick={() => updatePageParams({ objectID: undefined })}
        style={{ padding: '0.125em', display: 'flex' }}
        aria-label="Close"
      >
        <XIcon size="1em" />
      </HoverableButton>
    </div>
  );
};

const DetailsBody: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ padding: '1em' }}>{children}</div>;
};

export default DetailsPanel;
