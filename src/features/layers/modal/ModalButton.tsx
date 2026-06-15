import React, { ReactNode, useCallback, useState } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import ModalCard from '@features/layers/modal/ModalCard';

type Props = {
  buttonLabel: ReactNode;
  description?: ReactNode;
  buttonClassName?: string;
  title: ReactNode;
  body: ReactNode | (() => ReactNode);
};

const ModalButton: React.FC<Props> = ({
  body,
  buttonLabel,
  description,
  buttonClassName,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <HoverableButton
        className={buttonClassName}
        onClick={open}
        hoverContent={description}
        style={{ padding: '0.25em 0.5em' }}
      >
        {buttonLabel}
      </HoverableButton>

      {isOpen && (
        <ModalCard
          onClose={close}
          title={title}
          bodyStyle={{ width: '90vw', maxWidth: '85em', padding: '1em' }}
        >
          {typeof body === 'function' ? body() : body}
        </ModalCard>
      )}
    </>
  );
};

export default ModalButton;
