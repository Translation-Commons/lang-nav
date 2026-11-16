import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import Field from '@features/transforms/fields/Field';

import type { OrganizationData } from './OrganizationTypes';

type Props = { org?: OrganizationData };

const OrganizationCard: React.FC<Props> = ({ org }) => {
  return (
    <>
      <CardEntityField field={Field.TerritoryPrimary} ent={org} />

      {!!org?.censuses?.length && (
        <CardField field={Field.CountOfCensuses}>
          <HoverableEnumeration
            items={org.censuses.map((doc) => (
              <HoverableEntityName key={doc.ID} ent={doc} />
            ))}
          />
        </CardField>
      )}

      <CardExtraFields
        ent={org}
        excludeFields={[Field.Name, Field.Code, Field.TerritoryPrimary, Field.CountOfCensuses]}
      />
    </>
  );
};

export default OrganizationCard;
