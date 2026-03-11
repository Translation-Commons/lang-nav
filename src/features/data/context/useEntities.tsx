import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

const useEntities = (entityType?: ObjectType): EntityData[] => {
  const { objectType: pageEntityType } = usePageParams();
  const {
    languagesInSelectedSource,
    locales,
    territories,
    writingSystems,
    variantTags,
    censuses,
    keyboards,
  } = useDataContext();
  const objects = useMemo(() => {
    switch (entityType ?? pageEntityType) {
      case ObjectType.Census:
        return Object.values(censuses);
      case ObjectType.Language:
        return languagesInSelectedSource;
      case ObjectType.Locale:
        return locales;
      case ObjectType.Territory:
        return territories;
      case ObjectType.WritingSystem:
        return writingSystems;
      case ObjectType.VariantTag:
        return variantTags;
      case ObjectType.Keyboard:
        return keyboards;
    }
  }, [
    entityType,
    pageEntityType,
    censuses,
    languagesInSelectedSource,
    locales,
    territories,
    writingSystems,
    variantTags,
    keyboards,
  ]);
  return objects;
};

export default useEntities;
