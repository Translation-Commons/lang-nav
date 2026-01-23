import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import {
  LocaleData,
  TerritoryData,
  VariantTagData,
  WritingSystemData,
} from '@entities/types/DataTypes';

export type ObjectDataByType = {
  [ObjectType.Language]: LanguageData;
  [ObjectType.Locale]: LocaleData;
  [ObjectType.Territory]: TerritoryData;
  [ObjectType.WritingSystem]: WritingSystemData;
  [ObjectType.VariantTag]: VariantTagData;
  [ObjectType.Census]: CensusData;
};

function useObjects<K extends keyof ObjectDataByType>(type: K): ObjectDataByType[K][] {
  const { languagesInSelectedSource, locales, territories, writingSystems, variantTags, censuses } =
    useDataContext();

  switch (type) {
    case ObjectType.Census:
      return Object.values(censuses) as ObjectDataByType[typeof type][];
    case ObjectType.Language:
      return languagesInSelectedSource as ObjectDataByType[typeof type][];
    case ObjectType.Locale:
      return locales as ObjectDataByType[typeof type][];
    case ObjectType.Territory:
      return territories as ObjectDataByType[typeof type][];
    case ObjectType.WritingSystem:
      return writingSystems as ObjectDataByType[typeof type][];
    case ObjectType.VariantTag:
      return variantTags as ObjectDataByType[typeof type][];
  }
}

export default useObjects;
