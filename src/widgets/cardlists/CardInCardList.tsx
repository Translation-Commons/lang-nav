import React, { useCallback } from 'react';

import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import CardPinButton from './CardPinButton';

import './cardListStyles.css';

interface Props {
  children: React.ReactNode;
  getBackgroundColor?: (object: ObjectData) => string | undefined;
  object: ObjectData;
}

const CardInCardList: React.FC<Props> = ({ children, getBackgroundColor, object }) => {
  const { updatePageParams, objectID, pinned } = usePageParams();

  const isPinned = pinned.includes(object.ID);
  const togglePin = useCallback(() => {
    updatePageParams({
      pinned: isPinned ? pinned.filter((id) => id !== object.ID) : [...pinned, object.ID],
    });
  }, [isPinned, pinned, object.ID, updatePageParams]);

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
      role="button"
      style={{
        backgroundColor: getBackgroundColor ? (getBackgroundColor(object) ?? 'inherit') : undefined,
      }}
      tabIndex={0}
    >
      <CardPinButton isPinned={isPinned} onTogglePin={togglePin} />
      {children}
    </div>
  );
};

export default CardInCardList;
