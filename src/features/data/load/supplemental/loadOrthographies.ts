import { OrthographyDictionary } from '@entities/orthography/OrthographyTypes';
import { EntityType } from '@entities/types/EntityTypes';

export async function loadOrthographies(): Promise<OrthographyDictionary | void> {
  return await fetch('data/other_sources/hyperglot.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) => {
      const result: OrthographyDictionary = {};

      lines.forEach((line) => {
        const parts = line.split('\t');
        const languageCode = parts[0];
        const scriptCode = parts[1];
        const baseCharacters = parts[2]?.replace(/\p{Lu}/gu, '');
        if (!languageCode || !scriptCode || !baseCharacters) return;

        const ID = `${languageCode}_${scriptCode}`;
        const nameDisplay = `${scriptCode} (${languageCode})`;
        result[ID] = {
          type: EntityType.Orthography,
          ID,
          codeDisplay: ID,
          nameDisplay,
          names: [nameDisplay],
          languageCode,
          scriptCode,
          baseCharacters,
        };
      });

      return result;
    })
    .catch((err) => console.error('Error loading TSV:', err));
}
