import { XIcon } from 'lucide-react';
import React, { useEffect } from 'react';

import { useClickOutside } from '@shared/hooks/useClickOutside';

import HoverableButton from '../hovercard/HoverableButton';

import './modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  bodyStyle?: React.CSSProperties;
}

const ViewModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, bodyStyle }) => {
  const modalRef = useClickOutside(onClose);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return <></>;

  return (
    <div className="ModalOverlay">
      <div className="Modal" aria-modal="true" role="dialog" ref={modalRef}>
        <div className="ModalHeader">
          <div className="ModalTitle">{title}</div>
          <HoverableButton buttonType="reset" hoverContent="Close modal" onClick={onClose}>
            <XIcon size="1.5em" display="block" />
          </HoverableButton>
        </div>
        <div className="ModalBody" style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
