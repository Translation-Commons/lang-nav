import React, { useCallback } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';
import ObjectCard from '@entities/ui/ObjectCard';

type Props = {
  ent?: EntityData;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const HoverableObject: React.FC<Props> = ({ ent, children, style }) => {
  const { view, updatePageParams } = usePageParams();
  if (ent == null) {
    return <>{children}</>;
  }

  const onClick = useCallback(() => {
    const params: Partial<PageParams> = { entID: ent.ID };
    updatePageParams(params);
  }, [ent, updatePageParams, view]);

  return (
    <Hoverable
      hoverContent={
        <>
          Click to see more information in the details panel.
          <div>
            <strong>{ent.type}</strong>
          </div>
          <ObjectCard ent={ent} />
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
