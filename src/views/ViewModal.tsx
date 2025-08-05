import { ExpandIcon, XIcon } from 'lucide-react';
import React, { useEffect } from 'react';

import { usePageParams } from '../controls/PageParamsContext';
import ObjectPath from '../controls/pathnav/ObjectPath';
import { PathContainer } from '../controls/pathnav/PathNav';
import HoverableButton from '../generic/HoverableButton';
import { useClickOutside } from '../generic/useClickOutside';
import { View } from '../types/PageParamTypes';

import './modal.css';

import ObjectDetails from './common/details/ObjectDetails';
import getObjectFromID from './common/getObjectFromID';
import ObjectTitle from './common/ObjectTitle';

const ViewModal: React.FC = () => {
  const { objectID, view, updatePageParams } = usePageParams();
  const onClose = () => updatePageParams({ objectID: undefined });
  const object = getObjectFromID(objectID);

  const modalRef = useClickOutside(onClose);

  useEffect(() => {
    // TODO there is a problem with this changing the page parameters beyond the modal object
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && view != View.Details) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, view]);

  if (objectID == null || view === View.Details) {
    return <></>;
  }
  if (object == null) return <></>;

  return (
    <div className="ModalOverlay">
      {/* onClick={(e) => e.target === e.currentTarget && onClose()} */}
      <div className="Modal" aria-modal="true" role="dialog" ref={modalRef}>
        <div className="ModalHeader">
          <div className="ModalTitle">
            <ObjectTitle object={object} />
          </div>
          <div style={{ display: 'flex', gap: '.5em' }}>
            <HoverableButton
              hoverContent="Expand modal to page"
              onClick={() =>
                updatePageParams({
                  view: View.Details,
                })
              }
            >
              <ExpandIcon size="1.5em" display="block" />
            </HoverableButton>
            <HoverableButton hoverContent="Close modal" onClick={onClose}>
              <XIcon size="1.5em" display="block" />
            </HoverableButton>
          </div>
        </div>
        <div className="ModalBody">
          <PathContainer style={{ marginTop: '0.5em' }}>
            <ObjectPath />
          </PathContainer>
          <ObjectDetails object={object} />
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
