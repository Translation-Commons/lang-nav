import React from 'react';

import usePageParams from '@features/params/usePageParams';

import CensusCard from '@entities/census/CensusCard';
import type { CensusData } from '@entities/census/CensusTypes';
import KeyboardCard from '@entities/keyboard/KeyboardCard';
import type { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import LanguageCard from '@entities/language/LanguageCard';
import type { LanguageData } from '@entities/language/LanguageTypes';
import LocaleCard from '@entities/locale/LocaleCard';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import OrganizationCard from '@entities/org/OrganizationCard';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import OrthographyCard from '@entities/orthography/OrthographyCard';
import type { OrthographyData } from '@entities/orthography/OrthographyTypes';
import TechnologyCard from '@entities/tech/TechnologyCard';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import TerritoryCard from '@entities/territory/TerritoryCard';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import { type EntityData, EntityType } from '@entities/types/EntityTypes';
import VariantCard from '@entities/variant/VariantCard';
import type { VariantData } from '@entities/variant/VariantTypes';
import WritingSystemCard from '@entities/writingsystem/WritingSystemCard';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

const EntityCard: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  const { entType } = usePageParams();
  switch (ent?.type ?? entType) {
    case EntityType.Census:
      return <CensusCard census={ent as CensusData | undefined} />;
    case EntityType.Language:
      return <LanguageCard lang={ent as LanguageData | undefined} />;
    case EntityType.Locale:
      return <LocaleCard locale={ent as LocaleData | undefined} />;
    case EntityType.Territory:
      return <TerritoryCard territory={ent as TerritoryData | undefined} />;
    case EntityType.Variant:
      return <VariantCard data={ent as VariantData | undefined} />;
    case EntityType.WritingSystem:
      return <WritingSystemCard writingSystem={ent as WritingSystemData | undefined} />;
    case EntityType.Orthography:
      return <OrthographyCard orthography={ent as OrthographyData | undefined} />;
    case EntityType.Keyboard:
      return <KeyboardCard keyboard={ent as KeyboardData | undefined} />;
    case EntityType.Org:
      return <OrganizationCard org={ent as OrganizationData | undefined} />;
    case EntityType.Technology:
      return <TechnologyCard tech={ent as TechnologyData | undefined} />;
  }
};

export default EntityCard;
