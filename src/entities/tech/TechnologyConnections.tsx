import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { EntityData } from '@entities/types/EntityTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

import type { TechnologyData } from './TechnologyTypes';

const TechnologyConnections: React.FC<{ tech: TechnologyData }> = ({ tech }) => {
  const { parentTech, childTechs, relatedTechs, organization, keyboards } = tech;
  return (
    <DetailsSection title="Connections">
      <EntityList items={organization} title="Organization" />
      <EntityList items={parentTech} title="Parent Technology" />
      <EntityList items={childTechs} title="Child Technologies" />
      <EntityList items={relatedTechs} title="Related Technologies" />
      <EntityList items={keyboards} title="Keyboards" />
    </DetailsSection>
  );
};

type EntityListProps = {
  items?: EntityData[] | EntityData;
  title: string;
};

const EntityList: React.FC<EntityListProps> = ({ items, title }) => {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  return (
    <DetailsField title={title}>
      <CommaSeparated>
        {(Array.isArray(items) ? items : [items]).map((item) => (
          <HoverableEntityName key={item.ID} ent={item} />
        ))}
      </CommaSeparated>
    </DetailsField>
  );
};

export default TechnologyConnections;
