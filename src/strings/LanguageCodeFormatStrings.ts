import { LanguageCodeFormat, LanguageSource } from '@entities/language/LanguageTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getCodeFormatFromLanguageSource(
  languageSource: LanguageSource,
): LanguageCodeFormat {
  switch (languageSource) {
    case LanguageSource.CLDR:
      return LanguageCodeFormat.Prefer2LetterISO;
    case LanguageSource.ISO:
    case LanguageSource.UNESCO:
    case LanguageSource.Combined:
      return LanguageCodeFormat.Prefer3LetterISO;
    case LanguageSource.Glottolog:
      return LanguageCodeFormat.PreferGlottocode;
    default:
      enforceExhaustiveSwitch(languageSource);
  }
}

export function getFormatLabel(languageCodeFormat: LanguageCodeFormat): string {
  switch (languageCodeFormat) {
    case LanguageCodeFormat.Unset:
      return 'Default';
    case LanguageCodeFormat.Prefer2LetterISO:
      return 'Prefer ISO 639-1 (ab)';
    case LanguageCodeFormat.Prefer3LetterISO:
      return 'Prefer ISO 639-3/5 (abc)';
    case LanguageCodeFormat.PreferGlottocode:
      return 'Prefer Glottolog (abcd1234)';
    default:
      enforceExhaustiveSwitch(languageCodeFormat);
  }
}
