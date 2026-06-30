import { XIcon } from 'lucide-react';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import HoverableButton from '../hovercard/HoverableButton';
import ZIndex from '../ZIndex';

import './popupcard.css';

type Props = {
  // CTA
  buttonLabel: ReactNode;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  description?: ReactNode;

  // Card content
  title: ReactNode;
  body: ReactNode | ((close: () => void) => ReactNode);
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
  buttonStyle,
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
        style={buttonStyle}
      >
        {buttonLabel}
      </HoverableButton>
      {isOpen && (
        <div className="popupCard" role="dialog" style={{ zIndex: ZIndex.PopupCard }}>
          <div className="popupCardHeader">
            <div className="popupCardTitle">{title}</div>
            <HoverableButton onClick={closeCard} style={{ padding: '0.5em' }}>
              <XIcon size="1em" display="block" aria-label="Close" />
            </HoverableButton>
          </div>
          <div className="popupCardBody">{typeof body === 'function' ? body(closeCard) : body}</div>
          {ctas.length > 0 && <div className="popupCardFooter">{ctas}</div>}
        </div>
      )}
    </div>
  );
};

export default PopupCard;
