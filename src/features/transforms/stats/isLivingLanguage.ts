import { isLanguageOrMacrolanguage, LanguageData } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

export default function isLivingLanguage(lang: LanguageData): boolean {
  return isLanguageOrMacrolanguage(lang.scope) && lang.ISO.status === LanguageISOStatus.Living;
}
