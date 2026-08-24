import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

export default function getObjectFromID(inputObjectID?: string): EntityData | undefined {
  const { entID: pageObjectID } = usePageParams();
  const { censuses, getObject } = useDataContext();
  const entID = inputObjectID ?? pageObjectID;

  if (entID == null) return undefined;

  return censuses[entID] ?? getObject(entID);
}
