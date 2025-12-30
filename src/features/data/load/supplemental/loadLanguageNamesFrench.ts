import { LanguageData } from '@entities/language/LanguageTypes';

export function loadLanguageNamesFrench(
  getLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  return fetch('data/languageNamesFrench.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(2) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        // Code	nom_français
        const parts = line.split('\t');
        const language = getLanguage(parts[0]);
        if (!language) return;

        language.nameFrench = parts[1] ? parts[1].trim() : undefined;
      }),
    )
    .catch((err) => console.error('Error loading French language names:', err));
}
