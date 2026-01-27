import { XIcon } from 'lucide-react';
import React from 'react';

import ResizablePanel from '@widgets/controls/ResizablePanel';
import ObjectPath from '@widgets/pathnav/ObjectPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import ObjectDetails from './ObjectDetails';

const DetailsPanel: React.FC = () => {
  const { objectID, updatePageParams } = usePageParams();
  const onClose = () => updatePageParams({ objectID: undefined });
  const object = getObjectFromID(objectID);

  if (object == null) return <></>;

  return (
    <ResizablePanel isOpenedWithObject={true} defaultWidth={600} panelSide="right">
      <DetailsHeader>
        <DetailsTitle>
          <ObjectTitle object={object} highlightSearchMatches={false} />
          <ObjectSubtitle
            object={object}
            highlightSearchMatches={false}
            style={{ color: 'var(--color-button-secondary)' }}
          />
        </DetailsTitle>
        <div style={{ display: 'flex', gap: '.5em' }}>
          <HoverableButton buttonType="reset" hoverContent="Close modal" onClick={onClose}>
            <XIcon size="1.5em" display="block" />
          </HoverableButton>
        </div>
      </DetailsHeader>
      <DetailsBody>
        <PathContainer style={{ marginTop: '0.5em' }}>
          <ObjectPath />
        </PathContainer>
        <ObjectDetails object={object} />
      </DetailsBody>
    </ResizablePanel>
  );
};

const DetailsHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.25em',
        background: 'var(--color-button-primary)',
      }}
    >
      {children}
    </div>
  );
};

const DetailsTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        color: 'var(--color-background)',
        marginLeft: '20px',
        marginRight: '8px',
        fontSize: '1.75em',
        textAlign: 'left',
      }}
    >
      {children}
    </div>
  );
};

const DetailsBody: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ padding: '1em' }}>{children}</div>;
};

export default DetailsPanel;
