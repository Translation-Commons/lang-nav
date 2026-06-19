import { PinIcon, PinOffIcon } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

interface Props {
  children: React.ReactNode;
  getBackgroundColor?: (object: ObjectData) => string | undefined;
  object: ObjectData;
}

const CardInCardList: React.FC<Props> = ({ children, getBackgroundColor, object }) => {
  const { updatePageParams, objectID, pinned } = usePageParams();
  const [isHovering, setIsHovering] = React.useState(false);
  const [isHoveringPin, setIsHoveringPin] = React.useState(false);

  const isPinned = pinned.includes(object.ID);
  const togglePin = useCallback(() => {
    updatePageParams({
      pinned: isPinned ? pinned.filter((id) => id !== object.ID) : [...pinned, object.ID],
    });
  }, [isPinned, pinned, object.ID, updatePageParams]);

  // The pin button is only visible while hovering the card or when the card is already pinned.
  const showPinButton = isHovering || isPinned;
  // When a pinned card's button is hovered, show the "unpin" affordance instead.
  const PinButtonIcon = isPinned && isHoveringPin ? PinOffIcon : PinIcon;
  const borderColor = useMemo(() => {
    if (objectID === object.ID) return 'var(--color-button-primary)';
    if (isHovering) return 'var(--color-button-hover)';
    return 'transparent';
  }, [getBackgroundColor, object, isHovering, objectID]);
  const openObject = useCallback(() => {
    if (object) updatePageParams({ objectID: object.ID });
  }, [object, updatePageParams]);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Don't open the object if the user clicked on an interactive element inside the card (e.g. a button or link).
      const target = event.target as HTMLElement | null;
      if (target && target.closest('button,a,input,select,textarea')) return;
      openObject();
    },
    [openObject],
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // If the user isn't focused on an interactive element inside the card (e.g. a button or link).
      const target = event.target as HTMLElement | null;
      if (target && target.closest('button,a,input,select,textarea')) return;

      // Allow opening the object by pressing Enter or Space when the card is focused,
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        openObject();
      }
    },
    [openObject],
  );

  return (
    <div
      aria-label={`${object.nameDisplay} card, click to open details`}
      className={`CardInCardList ${object.ID === objectID ? 'selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="button"
      style={{
        position: 'relative',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '0.5em',
        boxShadow: 'var(--color-shadow) 0 0 1rem 2px',
        padding: '1rem',
        textAlign: 'start',
        cursor: 'pointer',
        borderColor: borderColor,
        backgroundColor: getBackgroundColor ? (getBackgroundColor(object) ?? 'inherit') : undefined,
      }}
      tabIndex={0}
    >
      {showPinButton && (
        <HoverableButton
          hoverContent={isPinned ? 'Unpin from the page' : 'Pin to the page'}
          onClick={togglePin}
          className="CardPinButton"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'transparent',
            border: 'none',
            padding: '0.25rem',
            lineHeight: 0,
            color: isPinned ? 'var(--color-button-primary)' : 'var(--color-text)',
          }}
        >
          <span
            aria-label={isPinned ? 'Unpin from the page' : 'Pin to the page'}
            onMouseEnter={() => setIsHoveringPin(true)}
            onMouseLeave={() => setIsHoveringPin(false)}
            style={{ display: 'inline-flex' }}
          >
            <PinButtonIcon size="1em" />
          </span>
        </HoverableButton>
      )}
      {children}
    </div>
  );
};

export default CardInCardList;
