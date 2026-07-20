import React from 'react';

import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { OrganizationData } from './OrganizationTypes';

type Props = { org: OrganizationData };

const OrganizationCard: React.FC<Props> = ({ org }) => {
  return (
    <div>
      <div className="text-[1.5em] mb-2">
        <ObjectTitle object={org} />
      </div>
      <CardField
        title="Headquartered In"
        field={Field.Territory}
        description="The territory where this organization is headquartered."
      >
        <HoverableObjectName object={org.headquarters} />
      </CardField>

      <CardField
        title="Census Tables"
        field={Field.CountOfCensuses}
        description="Tables of population information conducted by this organization and added to LangNav."
      >
        {org.censuses && org.censuses.length > 0 ? (
          <HoverableEnumeration
            items={org.censuses.map((doc) => (
              <HoverableObjectName key={doc.ID} object={doc} />
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
