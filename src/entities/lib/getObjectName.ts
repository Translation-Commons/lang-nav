import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

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
      return getLanguageSubtitle(object);
    case ObjectType.WritingSystem:
      return object.nameDisplay != object.nameFull ? object.nameFull : undefined;
    case ObjectType.Locale:
    case ObjectType.Territory:
      return undefined;
  }
}

function getLanguageSubtitle(lang: LanguageData): string | undefined {
  const composite = [getLanguageScopeLabel(lang.scope), lang.nameSubtitle]
    .filter(Boolean)
    .join(', ');
  return composite !== '' ? composite : undefined;
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
    case ObjectType.VariantTag:
      return 'variant tags';
  }
}
