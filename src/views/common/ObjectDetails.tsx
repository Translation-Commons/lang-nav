import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import { ObjectData } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import CensusDetails from '../census/CensusDetails';
import LanguageDetails from '../language/LanguageDetails';
import LocaleDetails from '../locale/LocaleDetails';
import TerritoryDetails from '../territory/TerritoryDetails';
import WritingSystemDetails from '../writingsystem/WritingSystemDetails';

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
  }
};

export function getObjectFromID(inputObjectID?: string): ObjectData | undefined {
  const { objectID: pageObjectID } = usePageParams();
  const { censuses, languagesBySource, territories, writingSystems, locales } = useDataContext();
  const objectID = inputObjectID ?? pageObjectID;

  if (objectID == null) return undefined;

  return (
    censuses[objectID] ??
    languagesBySource.All[objectID] ??
    languagesBySource.Glottolog[objectID] ?? // The Glottolog lookup should no longer be necessary since objects have a stable ID field, but keep just in case
    territories[objectID] ??
    locales[objectID] ??
    writingSystems[objectID]
  );
}

export default ObjectDetails;
