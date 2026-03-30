import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { ObjectBase } from '@entities/types/DataTypes';

export type VariantIANATag = string; // IANA tag, eg. valencia in cat-ES-valencia

export type VariantDictionary = Record<VariantIANATag, VariantData>;

export enum VariantType {
  Orthographic = 'o',
  Dialect = 'd',
}

export interface VariantData extends ObjectBase {
  type: ObjectType.Variant;
  ID: VariantIANATag;
  codeDisplay: VariantIANATag;
  nameDisplay: string;
  description?: string;

  dateAdded?: Date;
  prefixes: string[]; // Usually language codes but sometimes composites like zh-Latn or oc-lengadoc
  languageCodes: LanguageCode[]; // zh, oc, etc.
  localeCodes: StandardLocaleCode[]; // would look like zh-Latn-pinyin or oc-lengadoc-grclass

  // Additional data from Translation Commons
  variantType?: VariantType;
  languoidCode?: LanguageCode; // When this variant has a direct match to a languoid, this is the code of that languoid. For example "valencia" can be expressed as a variant (cat_valencia) OR a languoid from glottolog vale1252

  // References to other objects
  languages: LanguageData[]; // The languages that have this variation
  locales: LocaleData[];
  languoid?: LanguageData; // The precise languoid that matches this variant
}
