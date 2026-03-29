import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

export function getObjectSubtitle(object: ObjectData): string | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return [
        object.mode,
        object.proficiency,
        object.acquisitionOrder,
        object.domain && object.domain != 'Any' ? '@' + object.domain : null,
      ]
        .filter((c) => c != null && c != 'Any')
        .join(', ');
    case ObjectType.Language:
      return object.nameEndonym ?? object.nameSubtitle ?? undefined;
    case ObjectType.WritingSystem:
      return object.nameDisplay != object.nameFull ? object.nameFull : undefined;
    case ObjectType.Locale:
    case ObjectType.Territory:
      return undefined;
    case ObjectType.Keyboard:
      return undefined;
  }
}

export function getObjectTypeLabelPlural(objectType: ObjectType) {
  switch (objectType) {
    case ObjectType.Census:
      return 'censuses';
    case ObjectType.Language:
      return 'languages';
    case ObjectType.Locale:
      return 'locales';
    case ObjectType.Territory:
      return 'territories';
    case ObjectType.WritingSystem:
      return 'writing systems';
    case ObjectType.Variant:
      return 'variant tags';
    case ObjectType.Keyboard:
      return 'keyboards';
  }
}
