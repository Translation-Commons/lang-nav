import React, { useCallback } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { PageParamsOptional, View } from '@features/params/PageParamTypes';
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
    if (view === View.Details) params.objectType = object.type;
    updatePageParams(params);
  }, [object, updatePageParams, view]);

  return (
    <Hoverable
      hoverContent={
        <>
          Click to{' '}
          {view === View.Details
            ? 'change the page to see the details for:'
            : 'open modal with more information for:'}
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
