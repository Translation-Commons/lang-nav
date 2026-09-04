import React, { ReactNode } from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

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
  title,
  body,
  ctas = [],
}) => {
  return (
    <Popover>
      <PopoverTrigger delay={10}>
        <Button className={buttonClassName} style={buttonStyle} variant="default">
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="popupContainer">
          {title != null && (
            <div className="popupCardHeader">
              <div className="popupCardTitle">{title}</div>
            </div>
          )}
          <div className="popupCardBody">{typeof body === 'function' ? body() : body}</div>
          {ctas.length > 0 && <div className="popupCardFooter">{ctas}</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopupCard;
