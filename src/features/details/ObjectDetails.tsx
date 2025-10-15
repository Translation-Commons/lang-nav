import CensusDetails from '@entities/census/CensusDetails';
import LanguageDetails from '@entities/language/LanguageDetails';
import getObjectFromID from '@entities/lib/getObjectFromID';
import LocaleDetails from '@entities/locale/LocaleDetails';
import TerritoryDetails from '@entities/territory/TerritoryDetails';
import { ObjectData } from '@entities/types/DataTypes';
import VariantTagDetails from '@entities/varianttag/VariantTagDetails';
import WritingSystemDetails from '@entities/writingsystem/WritingSystemDetails';
import { ObjectType } from '@widgets/PageParamTypes';
import React from 'react';

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
