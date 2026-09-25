import { EntityType } from '@features/params/PageParamTypes';

import { OrthographyDictionary } from '@entities/orthography/OrthographyTypes';

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
        const scriptName = parts[1];
        const baseCharacters = parts[2]?.replace(/\p{Lu}/gu, '');
        if (!languageCode || !scriptName || !baseCharacters) return;

        const ID = `${languageCode}_${scriptName}`;
        result[ID] = {
          type: EntityType.Orthography,
          ID,
          codeDisplay: ID,
          nameDisplay: `${scriptName} (${languageCode})`,
          names: [scriptName],
          languageCode,
          scriptName,
          baseCharacters,
        };
      });

      return result;
    })
    .catch((err) => console.error('Error loading TSV:', err));
}