import React from 'react';

import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { EntityData } from '@entities/types/DataTypes';

import CodeDisplay from '@shared/ui/CodeDisplay';

type Props = {
  ent: EntityData;
  allowSidebar?: boolean;
  showData?: boolean;
};

const MapHoverCard: React.FC<Props> = ({ ent, allowSidebar, showData = true }) => {
  const fieldsWithInterest = useActiveTransforms([Field.Name, Field.Code]);

  const getDescription = () => {
    if (showData === false) return 'No languages passing filters';
    if (allowSidebar) return 'Click to pin to cardlist below';
    return 'Click to open in details panel';
  };

  return (
    <div className="text-xs flex flex-col gap-1">
      <div className="flex flex-row items-center gap-2 justify-between">
        <strong className="text-left">{ent.nameDisplay}</strong>
        <CodeDisplay>{ent.codeDisplay}</CodeDisplay>
      </div>
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
