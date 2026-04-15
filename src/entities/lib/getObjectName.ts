import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

export function getObjectSubtitle(object: ObjectData): string | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.nameEndonym ?? object.nameSubtitle ?? undefined;
    case ObjectType.WritingSystem:
      return object.nameDisplay != object.nameFull ? object.nameFull : undefined;
    case ObjectType.Locale:
    case ObjectType.Census:
    case ObjectType.Territory:
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
      return 'variants';
    case ObjectType.Keyboard:
      return 'keyboards';
  }
}
