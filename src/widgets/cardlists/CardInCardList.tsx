import React, { useMemo } from 'react';

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

  return (
    <div
      className={`CardInCardList ${object.ID === objectID ? 'selected' : ''}`}
      onClick={() => object && updatePageParams({ objectID: object.ID })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
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
    >
      {children}
    </div>
  );
};

export default CardInCardList;
