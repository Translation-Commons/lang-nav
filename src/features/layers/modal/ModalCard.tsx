import React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog';

interface ModalProps {
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  bodyStyle?: React.CSSProperties;
}

const ModalCard: React.FC<ModalProps> = ({ onClose, title, children, bodyStyle }) => {
  return (
    <Dialog
      open
      // Non-modal: keep background content in the a11y tree and interactive, matching the
      // previous overlay that intentionally did not trap focus or block outside hovercards.
      modal={false}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-auto max-w-[calc(100%-2rem)] flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div data-testid="modal-body" className="min-h-0 overflow-y-auto" style={bodyStyle}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCard;
