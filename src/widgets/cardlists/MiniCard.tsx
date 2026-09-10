import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';
import getField from '@features/transforms/fields/getField';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { EntityData } from '@entities/types/DataTypes';
import EntityName, { EntityNameLabelSource } from '@entities/ui/EntityName';

import CodeDisplay from '@shared/ui/CodeDisplay';
const MiniCard: React.FC<{ ent: EntityData; labelSource?: EntityNameLabelSource }> = ({
  ent,
  labelSource,
}) => {
  const fields = useActiveTransforms([Field.Name, Field.Code]);

  const [oldParams] = useSearchParams({});
  const nav = useNavigate();
  const onClick = useCallback(
    () => nav('/data?' + getNewURLSearchParams({ entID: ent.ID }, oldParams)),
    [nav, oldParams, ent.ID],
  );

  return (
    <div className="text-xs flex flex-col gap-1" onClick={onClick}>
      <div className="flex flex-row items-center gap-2 justify-between">
        <strong className="text-left">
          <EntityName ent={ent} labelSource={labelSource} />
        </strong>
        {!labelSource?.includes('code') && <CodeDisplay>{ent.codeDisplay}</CodeDisplay>}
      </div>
      {fields.map((field) => {
        const val = getField(ent, field);
        if (val == null) return null;
        return (
          <div key={field} className="flex items-center gap-1">
            <FieldIcon field={field} />
            <div className="max-w-20 truncate overflow-hidden" title={val?.toString()}>
              <EntityFieldDisplay ent={ent} field={field} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniCard;
