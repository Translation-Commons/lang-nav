import { ObjectType } from '@features/params/PageParamTypes';

import { LocaleData } from '@entities/locale/LocaleTypes';
import { ObjectData } from '@entities/types/DataTypes';
import { VariantType } from '@entities/variant/VariantTypes';

import PopulationFocus from '../types/PopulationFocus';

/**
 * This function breaks ties if the focus is missing or is overall, looking
 * at the entity and returning the use that's most prominent.
 */
export function getSpeakingOrWritingFocus(
  object: ObjectData,
  focus?: PopulationFocus,
): 'speaking' | 'writing' {
  if (focus === PopulationFocus.Speaking) return 'speaking';
  if (focus === PopulationFocus.Writing) return 'writing';
  if (object.type == ObjectType.Language) {
    if ((object.pop.writing.estimate ?? 0) > (object.pop.speaking.estimate ?? 0)) return 'writing';
    return 'speaking';
  }
  if (object.type == ObjectType.Locale) {
    const locale = object as LocaleData;
    if ((locale.pop.writing.adjusted ?? 0) > (locale.pop.speaking.adjusted ?? 0)) return 'writing';
    return 'speaking';
  }
  if (object.type == ObjectType.WritingSystem) return 'writing';
  if (object.type === ObjectType.Variant)
    return object.variantType === VariantType.Dialect ? 'speaking' : 'writing';
  return 'speaking'; // default to speaking if we don't know
}
