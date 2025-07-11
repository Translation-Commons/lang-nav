import { ExternalLinkIcon, XIcon } from 'lucide-react';
import React, { useEffect } from 'react';

import { usePageParams } from '../controls/PageParamsContext';
import Hoverable from '../generic/Hoverable';
import { useClickOutside } from '../generic/useClickOutside';
import { View } from '../types/PageParamTypes';

import './modal.css';

import ObjectDetails, { getObjectFromID } from './common/ObjectDetails';
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
          <div className="ModalButtons">
            <Hoverable hoverContent="Expand modal to page">
              <button
                onClick={() =>
                  updatePageParams({
                    view: View.Details,
                  })
                }
              >
                <ExternalLinkIcon size="1em" />
              </button>
            </Hoverable>
            <Hoverable hoverContent="Close modal">
              <button onClick={onClose}>
                <XIcon size="1em" />
              </button>
            </Hoverable>
          </div>
        </div>
        <div className="ModalBody">
          <ObjectDetails object={object} />
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
