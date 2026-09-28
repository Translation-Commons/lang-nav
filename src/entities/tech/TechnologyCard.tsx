import React from 'react';

import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';

import { TechnologyData } from './TechnologyTypes';

type Props = { tech: TechnologyData };

const TechnologyCard: React.FC<Props> = ({ tech }) => {
  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Code,
    Field.Population,
    // Field.Organization,
    // Field.LanguageList,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={tech} />
      </div>

      <CardField field={Field.Population}>
        <EntityFieldDisplay ent={tech} field={Field.Population} />
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={tech} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default TechnologyCard;
