import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';
import getField from '@features/transforms/fields/getField';

import { EntityData } from '@entities/types/DataTypes';

import { unique } from '@shared/lib/setUtils';

const MiniCard: React.FC<{ ent: EntityData }> = ({ ent }) => {
  const { colorBy, sortBy, scaleBy, fieldFocus } = usePageParams();
  const fields = unique([sortBy, colorBy, scaleBy, fieldFocus]).filter(
    (f) => f != Field.None && f != Field.Name && f != Field.Code,
  );
  const name = ent.type === EntityType.Locale ? ent.territory?.nameDisplay : ent.nameDisplay;

  const [oldParams] = useSearchParams({});
  const nav = useNavigate();
  const onClick = useCallback(
    () => nav('/data?' + getNewURLSearchParams({ entID: ent.ID }, oldParams)),
    [nav, oldParams, ent.ID],
  );

  return (
    <div className="text-xs flex flex-col gap-1" onClick={onClick}>
      <strong>{name}</strong>
      <div className="font-mono text-[10px]">{ent.codeDisplay}</div>
      {fields.map((field) => {
        const res = getField(ent, field);
        if (res == null) return null;
        return (
          <div key={field} className="flex items-center gap-1">
            <FieldIcon field={field} />
            <EntityFieldDisplay ent={ent} field={field} />
          </div>
        );
      })}
    </div>
  );
};

export default MiniCard;
