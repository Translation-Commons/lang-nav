import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';
import getField from '@features/transforms/fields/getField';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { EntityData } from '@entities/types/EntityTypes';
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
  const showCode = !labelSource?.includes('code');

  return (
    <div className="text-xs flex flex-col gap-1" onClick={onClick}>
      <div
        className={
          'w-full flex items-center gap-x-1 gap-y-0 justify-between' +
          (ent.codeDisplay.length > 5 || ent.nameDisplay.length > 20 ? ' flex-col' : ' flex-row')
        }
      >
        <strong
          className={
            'self-start text-start' +
            (ent.nameDisplay.split(/\W+/).length > 2 ? ' line-clamp-2' : '')
          }
        >
          <EntityName ent={ent} labelSource={labelSource} />
        </strong>
        {showCode && (
          <div className="self-end text-end">
            <CodeDisplay>{ent.codeDisplay}</CodeDisplay>
          </div>
        )}
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
