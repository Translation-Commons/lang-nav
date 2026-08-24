import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

export default function getEntityFromID(inputEntID?: string): EntityData | undefined {
  const { entID: pageEntID } = usePageParams();
  const { censuses, getEntity } = useDataContext();
  const entID = inputEntID ?? pageEntID;

  if (entID == null) return undefined;

  return censuses[entID] ?? getEntity(entID);
}
