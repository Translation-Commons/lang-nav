import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import { ObjectData } from '../../types/DataTypes';

export default function getObjectFromID(inputObjectID?: string): ObjectData | undefined {
  const { objectID: pageObjectID } = usePageParams();
  const { censuses, languagesBySource, territories, writingSystems, locales, variantTags } =
    useDataContext();
  const objectID = inputObjectID ?? pageObjectID;

  if (objectID == null) return undefined;

  return (
    censuses[objectID] ??
    languagesBySource.All[objectID] ??
    languagesBySource.BCP[objectID] ??
    languagesBySource.Glottolog[objectID] ?? // The Glottolog lookup should no longer be necessary since objects have a stable ID field, but keep just in case
    territories[objectID] ??
    locales[objectID] ??
    writingSystems[objectID] ??
    variantTags[objectID]
  );
}
