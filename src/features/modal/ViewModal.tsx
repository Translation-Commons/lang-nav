import { ExpandIcon, XIcon } from 'lucide-react';
import React, { useEffect } from 'react';

import ObjectDetails from '@widgets/details/ObjectDetails';
import ObjectPath from '@widgets/pathnav/ObjectPath';
import { PathContainer } from '@widgets/pathnav/PathNav';

import HoverableButton from '@features/hovercard/HoverableButton';
import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import ObjectTitle from '@entities/ui/ObjectTitle';

import { useClickOutside } from '@shared/hooks/useClickOutside';

import './modal.css';

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

  if (object == null || view === View.Details) return <></>;

  return (
    <div className="ModalOverlay">
      <div className="Modal" aria-modal="true" role="dialog" ref={modalRef}>
        <div className="ModalHeader">
          <div className="ModalTitle">
            <ObjectTitle object={object} />
          </div>
          <div style={{ display: 'flex', gap: '.5em' }}>
            <HoverableButton
              buttonType="submit"
              hoverContent="Expand modal to page"
              onClick={() =>
                updatePageParams({
                  view: View.Details,
                  objectType: object.type,
                })
              }
            >
              <ExpandIcon size="1.5em" display="block" />
            </HoverableButton>
            <HoverableButton buttonType="reset" hoverContent="Close modal" onClick={onClose}>
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
