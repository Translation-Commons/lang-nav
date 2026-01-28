import { XIcon } from 'lucide-react';
import React, { useEffect } from 'react';

import usePageParams from '@features/params/usePageParams';

import { useClickOutside } from '@shared/hooks/useClickOutside';

import HoverableButton from '../hovercard/HoverableButton';

import './modal.css';

// This modal is not used right now but the code and functionality is left in to be re-adapted for other purposes.
const ViewModal: React.FC = () => {
  const { objectID, updatePageParams } = usePageParams();
  const onClose = () => updatePageParams({ objectID: undefined });

  const modalRef = useClickOutside(onClose);

  useEffect(() => {
    // TODO there is a problem with this changing the page parameters beyond the modal object
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (objectID !== 'modal_test') return null;

  return (
    <div className="ModalOverlay">
      <div className="Modal" aria-modal="true" role="dialog" ref={modalRef}>
        <div className="ModalHeader">
          <div className="ModalTitle">Modal test active</div>
          <HoverableButton buttonType="reset" hoverContent="Close modal" onClick={onClose}>
            <XIcon size="1.5em" display="block" />
          </HoverableButton>
        </div>
        <div className="ModalBody">content</div>
      </div>
    </div>
  );
};

export default ViewModal;
