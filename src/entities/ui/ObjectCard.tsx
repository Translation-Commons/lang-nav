import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import CensusCard from '@entities/census/CensusCard';
import KeyboardCard from '@entities/keyboard/KeyboardCard';
import LanguageCard from '@entities/language/LanguageCard';
import LocaleCard from '@entities/locale/LocaleCard';
import OrganizationCard from '@entities/org/OrganizationCard';
import TerritoryCard from '@entities/territory/TerritoryCard';
import { EntityData } from '@entities/types/DataTypes';
import VariantCard from '@entities/variant/VariantCard';
import WritingSystemCard from '@entities/writingsystem/WritingSystemCard';

const ObjectCard: React.FC<{ ent: EntityData }> = ({ ent }) => {
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
    case EntityType.Keyboard:
      return <KeyboardCard keyboard={ent} />;
    case EntityType.Org:
      return <OrganizationCard org={ent} />;
  }
};

export default ObjectCard;
