import React from 'react';

import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { EntityData } from '@entities/types/EntityTypes';

import CardEntityField from './CardEntityField';

interface Props {
  ent?: EntityData;
  excludeFields: Field[];
}
const CardExtraFields: React.FC<Props> = ({ ent, excludeFields = [] }) => {
  const extraFields = useActiveTransforms(excludeFields);

  return extraFields.map((field) => <CardEntityField key={field} field={field} ent={ent} />);
};

export default CardExtraFields;
