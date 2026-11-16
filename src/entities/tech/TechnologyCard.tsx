import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import Field from '@features/transforms/fields/Field';
import { getLanguagesRelevantToEntity } from '@features/transforms/filtering/filterByConnections';

import { TechnologyData } from './TechnologyTypes';

type Props = { tech?: TechnologyData };

const TechnologyCard: React.FC<Props> = ({ tech }) => {
  return (
    <>
      <CardEntityField field={Field.Population} ent={tech} />

      <CardEntityField ent={tech} field={Field.Organization} />

      {!tech && <CardEntityField field={Field.CountOfLanguages} />}
      {(!!tech?.languageSupport || !!tech?.keyboards) && (
        <CardField field={Field.CountOfLanguages}>
          <HoverableEnumeration
            items={getLanguagesRelevantToEntity(tech).map((lang) => (
              <HoverableEntityName ent={lang} key={lang.ID} />
            ))}
          />
        </CardField>
      )}

      <CardExtraFields
        ent={tech}
        excludeFields={[
          Field.Name,
          Field.Code,
          Field.Population,
          Field.Organization,
          Field.CountOfLanguages,
        ]}
      />
    </>
  );
};

export default TechnologyCard;
