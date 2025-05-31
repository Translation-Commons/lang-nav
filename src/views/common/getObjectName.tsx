import { ObjectData } from '../../types/DataTypes';
import { LanguageData, LanguageScope } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

export function getObjectSubtitle(object: ObjectData): string | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return [
        object.modality,
        object.proficiency,
        object.acquisitionOrder,
        object.domain && object.domain != 'Any' ? '@' + object.domain : null,
      ]
        .filter((c) => c != null && c != 'Any')
        .join(', ');
    case ObjectType.Language:
      return getLanguageSubtitle(object);
    case ObjectType.Locale:
      return undefined;
    case ObjectType.Territory:
      return object.territoryType;
    case ObjectType.WritingSystem:
      return object.nameDisplay != object.nameFull ? object.nameFull : undefined;
  }
}

function getLanguageSubtitle(lang: LanguageData): string | undefined {
  let nameSubtitle: string | undefined = lang.nameSubtitle;
  let scope = lang.scope;
  if (nameSubtitle === 'macrolanguage') {
    nameSubtitle = undefined; // Already covered by the scope argument
  }
  if (scope == LanguageScope.Language) {
    scope = undefined; // Not particularly interesting
  }
  const composite = [scope, nameSubtitle].filter(Boolean).join(', ');
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
  }
}
