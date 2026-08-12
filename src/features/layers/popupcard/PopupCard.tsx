import React, { ReactNode } from 'react';

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
  justifyCard?: 'left' | 'right' | 'center';
  title?: ReactNode;
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
  buttonStyle,
  description,
  justifyCard = 'right',
  title,
  body,
  ctas = [],
}) => {
  return (
    <div className="popupContainer">
      <HoverableButton
        className={'popupToggle' + (buttonClassName ? ` ${buttonClassName}` : '')}
        hoverContent={description}
        onClick={() => {}} /* Set in CSS */
        style={buttonStyle}
      >
        {buttonLabel}
      </HoverableButton>
      <div
        className={`popupCard popupCardAlign-${justifyCard}`}
        role="dialog"
        style={{ zIndex: ZIndex.PopupCard }}
      >
        {title != null && (
          <div className="popupCardHeader">
            <div className="popupCardTitle">{title}</div>
          </div>
        )}
        <div className="popupCardBody">{typeof body === 'function' ? body() : body}</div>
        {ctas.length > 0 && <div className="popupCardFooter">{ctas}</div>}
      </div>
    </div>
  );
};

export default PopupCard;
