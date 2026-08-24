import { EntityType } from '@features/params/PageParamTypes';

import { LocaleData } from '@entities/locale/LocaleTypes';
import { EntityData } from '@entities/types/DataTypes';
import { VariantType } from '@entities/variant/VariantTypes';

import PopulationFocus from '../types/PopulationFocus';

/**
 * This function breaks ties if the focus is missing or is overall, looking
 * at the entity and returning the use that's most prominent.
 */
export function getSpeakingOrWritingFocus(
  ent: EntityData,
  focus?: PopulationFocus,
): 'speaking' | 'writing' {
  if (focus === PopulationFocus.Speaking) return 'speaking';
  if (focus === PopulationFocus.Writing) return 'writing';
  if (ent.type == EntityType.Language) {
    if ((ent.pop.writing.estimate ?? 0) > (ent.pop.speaking.estimate ?? 0)) return 'writing';
    return 'speaking';
  }
  if (ent.type == EntityType.Locale) {
    const locale = ent as LocaleData;
    if ((locale.pop.writing.adjusted ?? 0) > (locale.pop.speaking.adjusted ?? 0)) return 'writing';
    return 'speaking';
  }
  if (ent.type == EntityType.WritingSystem) return 'writing';
  if (ent.type === EntityType.Variant)
    return ent.variantType === VariantType.Dialect ? 'speaking' : 'writing';
  return 'speaking'; // default to speaking if we don't know
}
