import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import getObjectFromID from '@entities/lib/getObjectFromID';
import { ObjectData } from '@entities/types/DataTypes';

import CensusDetails from './CensusDetails';
import LanguageDetails from './LanguageDetails';
import LocaleDetails from './LocaleDetails';
import TerritoryDetails from './TerritoryDetails';
import VariantTagDetails from './VariantTagDetails';
import WritingSystemDetails from './WritingSystemDetails';

// You can get the details by an object or just its ID
type Props = { object?: ObjectData; objectID?: string };

const ObjectDetails: React.FC<Props> = ({ object, objectID }) => {
  if (object == null) {
    if (objectID != null) {
      return <ObjectDetails object={getObjectFromID(objectID)} />;
    }
    return <></>;
  }

  switch (object.type) {
    case ObjectType.Census:
      return <CensusDetails census={object} />;
    case ObjectType.Language:
      return <LanguageDetails lang={object} />;
    case ObjectType.Locale:
      return <LocaleDetails locale={object} />;
    case ObjectType.Territory:
      return <TerritoryDetails territory={object} />;
    case ObjectType.WritingSystem:
      return <WritingSystemDetails writingSystem={object} />;
    case ObjectType.VariantTag:
      return <VariantTagDetails variantTag={object} />;
  }
};

export default ObjectDetails;
