// src/views/varianttag/VariantTagCard.tsx

import { VariantTagData } from '../../types/DataTypes';
import ObjectTitle from '../common/ObjectTitle';
import ObjectField from '../common/ObjectField';

export function VariantTagCard({ data }: { data: VariantTagData }) {
  return (
    <div className="card">
      <ObjectTitle object={data} />
      <ObjectField name="Tag" value={data.codeDisplay} />
      <ObjectField name="Name" value={data.nameDisplay} />
      <ObjectField name="Description" value={data.description} />
    </div>
  );
}
