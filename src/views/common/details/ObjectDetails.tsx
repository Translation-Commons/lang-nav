import React from 'react';

import { ObjectData } from '../../../types/DataTypes';
import { ObjectType } from '../../../types/PageParamTypes';
import CensusDetails from '../../census/CensusDetails';
import LanguageDetails from '../../language/LanguageDetails';
import LocaleDetails from '../../locale/LocaleDetails';
import TerritoryDetails from '../../territory/TerritoryDetails';
import VariantTagDetails from '../../varianttag/VariantTagDetails';
import WritingSystemDetails from '../../writingsystem/WritingSystemDetails';
import getObjectFromID from '../getObjectFromID';

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
