import React from 'react';

import CensusDetails from '@entities/census/CensusDetails';
import KeyboardDetails from '@entities/keyboard/KeyboardDetails';
import LanguageDetails from '@entities/language/LanguageDetails';
import getEntityFromID from '@entities/lib/getEntityFromID';
import LocaleDetails from '@entities/locale/LocaleDetails';
import OrganizationDetails from '@entities/org/OrganizationDetails';
import TechnologyDetails from '@entities/tech/TechnologyDetails';
import TerritoryDetails from '@entities/territory/TerritoryDetails';
import { EntityData, EntityType } from '@entities/types/EntityTypes';
import VariantDetails from '@entities/variant/VariantDetails';
import WritingSystemDetails from '@entities/writingsystem/WritingSystemDetails';

// You can get the details by an entity or just its ID
type Props = { ent?: EntityData; entID?: string };

const EntityDetailsBody: React.FC<Props> = ({ ent, entID }) => {
  if (ent == null) {
    if (entID != null) {
      return <EntityDetailsBody ent={getEntityFromID(entID)} />;
    }
    return <></>;
  }

  switch (ent.type) {
    case EntityType.Census:
      return <CensusDetails census={ent} />;
    case EntityType.Language:
      return <LanguageDetails lang={ent} />;
    case EntityType.Locale:
      return <LocaleDetails locale={ent} />;
    case EntityType.Territory:
      return <TerritoryDetails territory={ent} />;
    case EntityType.WritingSystem:
      return <WritingSystemDetails writingSystem={ent} />;
    case EntityType.Variant:
      return <VariantDetails variant={ent} />;
    case EntityType.Keyboard:
      return <KeyboardDetails keyboard={ent} />;
    case EntityType.Org:
      return <OrganizationDetails org={ent} />;
    case EntityType.Technology:
      return <TechnologyDetails tech={ent} />;
  }
};

export default EntityDetailsBody;
