import React from 'react';

import CensusCard from '@entities/census/CensusCard';
import KeyboardCard from '@entities/keyboard/KeyboardCard';
import LanguageCard from '@entities/language/LanguageCard';
import LocaleCard from '@entities/locale/LocaleCard';
import OrganizationCard from '@entities/org/OrganizationCard';
import OrthographyCard from '@entities/orthography/OrthographyCard';
import TechnologyCard from '@entities/tech/TechnologyCard';
import TerritoryCard from '@entities/territory/TerritoryCard';
import { EntityData, EntityType } from '@entities/types/EntityTypes';
import VariantCard from '@entities/variant/VariantCard';
import WritingSystemCard from '@entities/writingsystem/WritingSystemCard';

const EntityCard: React.FC<{ ent: EntityData }> = ({ ent }) => {
  switch (ent.type) {
    case EntityType.Census:
      return <CensusCard census={ent} />;
    case EntityType.Language:
      return <LanguageCard lang={ent} />;
    case EntityType.Locale:
      return <LocaleCard locale={ent} />;
    case EntityType.Territory:
      return <TerritoryCard territory={ent} />;
    case EntityType.Variant:
      return <VariantCard data={ent} />;
    case EntityType.WritingSystem:
      return <WritingSystemCard writingSystem={ent} />;
    case EntityType.Orthography:
      return <OrthographyCard orthography={ent} />;
    case EntityType.Keyboard:
      return <KeyboardCard keyboard={ent} />;
    case EntityType.Org:
      return <OrganizationCard org={ent} />;
    case EntityType.Technology:
      return <TechnologyCard tech={ent} />;
  }
};

export default EntityCard;
