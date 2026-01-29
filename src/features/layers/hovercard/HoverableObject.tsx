import React, { useCallback } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

type Props = {
  object?: ObjectData;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const HoverableObject: React.FC<Props> = ({ object, children, style }) => {
  const { view, updatePageParams } = usePageParams();
  if (object == null) {
    return <>{children}</>;
  }

  const onClick = useCallback(() => {
    const params: PageParamsOptional = { objectID: object.ID };
    updatePageParams(params);
  }, [object, updatePageParams, view]);

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
      style={style}
    >
      {children}
    </Hoverable>
  );
};

export default HoverableObject;
