import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

const useEntities = (entityType?: EntityType): EntityData[] => {
  const { entityType: pageEntityType } = usePageParams();
  const {
    languagesInSelectedSource,
    locales,
    territories,
    writingSystems,
    variants,
    censuses,
    keyboards,
    organizations,
  } = useDataContext();
  const ents = useMemo(() => {
    switch (entityType ?? pageEntityType) {
      case EntityType.Census:
        return Object.values(censuses);
      case EntityType.Language:
        return languagesInSelectedSource;
      case EntityType.Locale:
        return locales;
      case EntityType.Territory:
        return territories;
      case EntityType.WritingSystem:
        return writingSystems;
      case EntityType.Variant:
        return variants;
      case EntityType.Keyboard:
        return keyboards;
      case EntityType.Org:
        return organizations;
    }
  }, [
    entityType,
    pageEntityType,
    censuses,
    languagesInSelectedSource,
    locales,
    territories,
    writingSystems,
    variants,
    keyboards,
    organizations,
  ]);
  return ents;
};

export default useEntities;
