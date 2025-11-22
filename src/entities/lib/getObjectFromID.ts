import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

export default function getObjectFromID(inputObjectID?: string): ObjectData | undefined {
  const { objectID: pageObjectID } = usePageParams();
  const { censuses, getObject } = useDataContext();
  const objectID = inputObjectID ?? pageObjectID;

  if (objectID == null) return undefined;

  return censuses[objectID] ?? getObject(objectID);
}
