import React from 'react';

import { EntityType } from '@features/params/PageParamTypes';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { EntityData } from '@entities/types/DataTypes';

import CensusDetails from './CensusDetails';
import KeyboardDetails from './KeyboardDetails';
import LanguageDetails from './LanguageDetails';
import LocaleDetails from './LocaleDetails';
import OrganizationDetails from './OrganizationDetails';
import TerritoryDetails from './TerritoryDetails';
import VariantDetails from './VariantDetails';
import WritingSystemDetails from './WritingSystemDetails';

// You can get the details by an object or just its ID
type Props = { ent?: EntityData; entID?: string };

const ObjectDetails: React.FC<Props> = ({ ent, entID }) => {
  if (ent == null) {
    if (entID != null) {
      return <ObjectDetails ent={getObjectFromID(entID)} />;
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
  }
};

export default ObjectDetails;
