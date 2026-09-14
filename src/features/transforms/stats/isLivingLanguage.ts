import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

export default function isLivingLanguage(lang: LanguageData): boolean {
  return (
    (lang.scope === LanguageScope.Language || lang.scope === LanguageScope.Macrolanguage) &&
    lang.ISO.status === LanguageISOStatus.Living
  );
}
