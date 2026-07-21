import React, { useCallback } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

type Props = {
  object?: ObjectData;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const HoverableObject: React.FC<Props> = ({ object, children, className, style }) => {
  const { updatePageParams } = usePageParams();
  const onClick = useCallback(() => {
    if (object == null) return;
    const params: Partial<PageParams> = { objectID: object.ID };
    updatePageParams(params);
  }, [object, updatePageParams]);

  if (object == null) {
    return <>{children}</>;
  }

  return (
    <Hoverable
      hoverContent={
        <>
          Click to see more information in the details panel.
          <div>
            <strong>{object.type}</strong>
          </div>
          <ObjectCard object={object} />
        </>
      }
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </Hoverable>
  );
};

export default HoverableObject;
