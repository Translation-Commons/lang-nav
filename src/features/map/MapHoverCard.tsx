import React from 'react';

import usePageParams from '@features/params/usePageParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';

import { EntityData } from '@entities/types/DataTypes';

import { unique } from '@shared/lib/setUtils';

type Props = {
  ent: EntityData;
  allowSidebar?: boolean;
  showData?: boolean;
};

const MapHoverCard: React.FC<Props> = ({ ent, allowSidebar, showData = true }) => {
  const { colorBy, sortBy, scaleBy, fieldFocus } = usePageParams();
  const fieldsWithInterest = unique([colorBy, sortBy, scaleBy, fieldFocus]).filter(
    (f) => f != Field.None,
  );

  const getDescription = () => {
    if (showData === false) return 'No languages passing filters';
    if (allowSidebar) return 'Click to open in sidebar';
    return 'Click to open in details panel';
  };

  return (
    <div className="text-xs flex flex-col gap-1">
      <strong>{ent.nameDisplay}</strong>
      {showData &&
        fieldsWithInterest.length > 0 &&
        fieldsWithInterest.map((field) => (
          <div key={field} className="flex items-center gap-2">
            <FieldIcon field={field} />
            <EntityFieldDisplay ent={ent} field={field} />
          </div>
        ))}
      <div style={{ color: 'var(--color-text-secondary)' }}>{getDescription()}</div>
    </div>
  );
};

export default MapHoverCard;
