import React, { PropsWithChildren, useCallback } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/EntityTypes';

import PinButton from '@shared/ui/PinButton';

import LargeCard from './LargeCard';

interface Props {
  getBackgroundColor?: (ent: EntityData) => string | undefined;
  ent: EntityData;
}

const CardInCardList: React.FC<PropsWithChildren<Partial<Props>>> = ({
  children,
  getBackgroundColor,
  ent,
}) => {
  if (!ent) return <PlaceholderCard>{children}</PlaceholderCard>;
  return (
    <InteractiveCard getBackgroundColor={getBackgroundColor} ent={ent}>
      {children}
    </InteractiveCard>
  );
};

const InteractiveCard: React.FC<PropsWithChildren<Props>> = ({
  children,
  getBackgroundColor,
  ent,
}) => {
  const { updatePageParams, entID } = usePageParams();

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
  let backgroundColor = getBackgroundColor ? (getBackgroundColor(ent) ?? 'inherit') : undefined;
  if (backgroundColor?.match(/\([.0-9]+%? [.0-9]+%? [.0-9]+%?\)$/))
    backgroundColor = 'color-mix(in srgb, ' + backgroundColor + ' 50%, var(--background))';

  return (
    <LargeCard
      aria-label={`${ent.nameDisplay} card, click to open details`}
      selected={ent.ID === entID}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ backgroundColor }}
    >
      <PinButton
        className="invisible group-hover:visible data-pressed:visible absolute top-2 right-2 bg-transparent!"
        ent={ent}
      />
      {children}
    </LargeCard>
  );
};

const PlaceholderCard: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <LargeCard>
      <div className="flex flex-col gap-2">{children}</div>
    </LargeCard>
  );
};

export default CardInCardList;
