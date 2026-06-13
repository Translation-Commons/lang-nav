import { XIcon } from 'lucide-react';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import HoverableButton from '../hovercard/HoverableButton';
import ZIndex from '../ZIndex';

import './popupcard.css';

type Props = {
  buttonLabel: ReactNode;
  description: ReactNode;
  buttonClassName?: string;
  title: ReactNode;
  body: ReactNode | (() => ReactNode);
  ctas?: ReactNode[];
};

/**
 * Opens a card that displays on the page and does not close when the user moves their mouse.
 * Used for displaying more complex information that the user may want to interact with, such
 * as a list of view options.
 */
const PopupCard: React.FC<Props> = ({
  buttonLabel,
  buttonClassName,
  description,
  title,
  body,
  ctas = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeCard = useCallback(() => setIsOpen(false), []);

  // Close the dropdown when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close the dropdown when the user presses the Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCard();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCard]);

  // Not done: Close the dropdown when the user clicks outside of it.
  // This is tricky because clicking on a nested card in the dropdown (particularly
  // a hovercard) should not close the dropdown.)

  return (
    <div className="popupContainer">
      <HoverableButton
        className={
          'popupToggle' +
          (isOpen ? ' ButtonFocused' : '') +
          (buttonClassName ? ` ${buttonClassName}` : '')
        }
        hoverContent={description}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {buttonLabel}
      </HoverableButton>
      {isOpen && (
        <div className="popupCard" role="dialog" style={{ zIndex: ZIndex.PopupCard }}>
          <div className="popupCardHeader">
            <div className="popupCardTitle">{title}</div>
            <HoverableButton onClick={closeCard} style={{ padding: '0.5em' }}>
              <XIcon size="1em" display="block" />
            </HoverableButton>
          </div>
          <div className="popupCardBody">{typeof body === 'function' ? body() : body}</div>
          {ctas.length > 0 && (
            <div className="popupCardFooter">
              {ctas}
              {/* {[
                ...ctas,
                <HoverableButton key="close" onClick={closeCard}>
                    Close
                </HoverableButton>,
                ]} */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PopupCard;
