import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import Field from '@features/transforms/fields/Field';

import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

import { OrganizationData } from './OrganizationTypes';

type Props = { org: OrganizationData };

const OrganizationCard: React.FC<Props> = ({ org }) => {
  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={org} />
      </div>
      <CardField
        title="Headquartered In"
        field={Field.Territory}
        description="The territory where this organization is headquartered."
      >
        <HoverableEntityName ent={org.headquarters} />
      </CardField>

      <CardField
        title="Census Tables"
        field={Field.CountOfCensuses}
        description="Tables of population information conducted by this organization and added to LangNav."
      >
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
    </div>
  );
};

export default OrganizationCard;
