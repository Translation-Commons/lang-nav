import { LocaleSeparator } from '@features/page-params/PageParamTypes';

import { LanguageData, LanguageSource } from '@entities/language/LanguageTypes';
import { getLocaleCode, getLocaleName } from '@entities/locale/LocaleStrings';
import { LocaleData } from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';

export function updateLanguagesBasedOnSource(
  languages: LanguageData[],
  locales: LocaleData[],
  languageSource: LanguageSource,
  localeSeparator: LocaleSeparator,
): void {
  // Update language codes and other values used for filtering
  languages.forEach((lang) => {
    const specific = lang.sourceSpecific[languageSource];
    lang.codeDisplay = specific.code ?? lang.ID;
    lang.nameDisplay = specific.name ?? lang.nameCanonical;
    lang.names = uniqueBy(
      [
        lang.nameCanonical,
        lang.nameEndonym,
        ...Object.values(lang.sourceSpecific).map((l) => l.name),
      ].filter((s) => s != null),
      (s) => s,
    );
    lang.scope = specific.scope ?? lang.scope;
    lang.populationOfDescendents = specific.populationOfDescendents ?? undefined;
    lang.populationEstimate =
      Math.max(
        lang.populationCited ?? specific.populationOfDescendents ?? 0,
        lang.populationFromLocales ?? 0,
      ) || undefined;
    lang.parentLanguage = specific.parentLanguage ?? undefined;
    lang.childLanguages = specific.childLanguages ?? [];
  });

  // Update locales too, their codes and their names
  Object.values(locales).forEach((loc) => {
    loc.codeDisplay = getLocaleCode(loc, localeSeparator);
    const localeName = getLocaleName(loc);
    loc.nameDisplay = localeName; // Set the display name

    // Add it to the names array so it can be used in search
    if (!loc.names.includes(localeName)) loc.names.push(localeName);
  });
}
