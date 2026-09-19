import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

import { OrganizationData } from './OrganizationTypes';

type Props = { org: OrganizationData };

const OrganizationCard: React.FC<Props> = ({ org }) => {
  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Code,
    Field.Territory,
    Field.CountOfCensuses,
    Field.Population,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={org} />
      </div>
      <CardField field={Field.Territory}>
        <HoverableEntityName ent={org.headquarters} />
      </CardField>

      <CardField field={Field.CountOfCensuses}>
        {org.censuses && org.censuses.length > 0 ? (
          <HoverableEnumeration
            items={org.censuses.map((doc) => (
              <HoverableEntityName key={doc.ID} ent={doc} />
            ))}
          />
        ) : (
          <Deemphasized>No census tables</Deemphasized>
        )}
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={org} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default OrganizationCard;
