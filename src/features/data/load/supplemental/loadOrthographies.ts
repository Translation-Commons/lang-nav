import { LanguageCode } from '@entities/language/LanguageTypes';
import { Orthography } from '@entities/orthography/OrthographyTypes';

export async function loadOrthographies(): Promise<Record<LanguageCode, Orthography[]> | void> {
  return await fetch('data/other_sources/hyperglot.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) => {
      const result: Record<LanguageCode, Orthography[]> = {};

      lines.forEach((line) => {
        const parts = line.split('\t');
        const code = parts[0];
        const scriptName = parts[1];
        const baseCharacters = parts[2].replace(/\p{Lu}/gu, '');
        if (!code || !scriptName || !baseCharacters) return;

        if (!result[code]) result[code] = [];
        result[code].push({ languageCode: code, scriptName, baseCharacters });
      });

      return result;
    })
    .catch((err) => console.error('Error loading TSV:', err));
}
