import React from 'react';

import CardField from '@widgets/cardlists/CardField';

import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';

import { EntityData } from '@entities/types/EntityTypes';

interface Props {
  ent?: EntityData;
  field: Field;
}
const CardEntityField: React.FC<Props> = ({ ent, field }) => {
  return (
    <CardField field={field}>
      <EntityFieldDisplay ent={ent} field={field} />
    </CardField>
  );
};

export default CardEntityField;
