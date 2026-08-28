import React, { useCallback } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import PinButton from '@shared/ui/PinButton';

import './cardListStyles.css';

interface Props {
  children: React.ReactNode;
  getBackgroundColor?: (ent: EntityData) => string | undefined;
  ent: EntityData;
}

const CardInCardList: React.FC<Props> = ({ children, getBackgroundColor, ent }) => {
  const { updatePageParams, entID, pinned } = usePageParams();

  const isPinned = pinned.includes(ent.ID);
  const togglePin = useCallback(() => {
    updatePageParams({
      pinned: isPinned ? pinned.filter((id) => id !== ent.ID) : [...pinned, ent.ID],
    });
  }, [isPinned, pinned, ent.ID, updatePageParams]);

  const openEntity = useCallback(() => {
    if (ent) updatePageParams({ entID: ent.ID });
  }, [ent, updatePageParams]);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Don't open the entity if the user clicked on an interactive element inside the card (e.g. a button or link).
      const target = event.target as HTMLElement | null;
      if (target && target.closest('button,a,input,select,textarea')) return;
      openEntity();
    },
    [openEntity],
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // If the user isn't focused on an interactive element inside the card (e.g. a button or link).
      const target = event.target as HTMLElement | null;
      if (target && target.closest('button,a,input,select,textarea')) return;

      // Allow opening the entity by pressing Enter or Space when the card is focused,
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        openEntity();
      }
    },
    [openEntity],
  );

  return (
    <div
      aria-label={`${ent.nameDisplay} card, click to open details`}
      className={`CardInCardList ${ent.ID === entID ? 'selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      style={{
        backgroundColor: getBackgroundColor ? (getBackgroundColor(ent) ?? 'inherit') : undefined,
      }}
      tabIndex={0}
    >
      <PinButton className="bg-transparent!" isPinned={isPinned} onTogglePin={togglePin} />
      {children}
    </div>
  );
};

export default CardInCardList;
