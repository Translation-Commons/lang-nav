import React, { useCallback, useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

interface Props {
  children: React.ReactNode;
  getBackgroundColor?: (object: ObjectData) => string | undefined;
  object: ObjectData;
}

const CardInCardList: React.FC<Props> = ({ children, getBackgroundColor, object }) => {
  const { updatePageParams, objectID } = usePageParams();
  const [isHovering, setIsHovering] = React.useState(false);
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
      {children}
    </div>
  );
};

export default CardInCardList;
