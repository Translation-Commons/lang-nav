import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { parseLanguageScope } from '@strings/LanguageScopeStrings';

export async function loadLanguageScopeOverrides(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/tc/languageScopeOverrides.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        // Code	Name	Scope Rationale
        const parts = line.split('\t');
        const language = getLanguage(parts[0]);
        if (!language) return;

        language.Combined.scope = parseLanguageScope(parts[2]);
        language.scope = parseLanguageScope(parts[2]);

        // If its children are labeled as subfamilies, upgrade them to families
        language.Combined.childLanguages?.forEach((child) => {
          if (child && child.Combined.scope === LanguageScope.Subfamily) {
            child.Combined.scope = LanguageScope.Family;
            child.scope = LanguageScope.Family;
          }
        });
      }),
    )
    .catch((err) => console.error('Error loading language scope overrides:', err));
}
