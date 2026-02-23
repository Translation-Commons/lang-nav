import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { ObjectBase } from '@entities/types/DataTypes';

export type VariantIANATag = string; // IANA tag, eg. valencia in cat-ES-valencia

export type VariantTagDictionary = Record<VariantIANATag, VariantTagData>;

export interface VariantTagData extends ObjectBase {
  type: ObjectType.VariantTag;
  ID: VariantIANATag;
  codeDisplay: VariantIANATag;
  nameDisplay: string;
  description?: string;

  dateAdded?: Date;
  prefixes: string[]; // Usually language codes but sometimes composites like zh-Latn or oc-lengadoc
  languageCodes: LanguageCode[]; // zh, oc, etc.
  localeCodes: StandardLocaleCode[]; // would look like zh-Latn-pinyin or oc-lengadoc-grclass

  // References to other objects
  languages: LanguageData[];
  locales: LocaleData[];
}
