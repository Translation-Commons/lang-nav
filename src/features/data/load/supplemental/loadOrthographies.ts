import { OrthographyDictionary } from '@entities/orthography/OrthographyTypes';
import { EntityType } from '@entities/types/EntityTypes';

export async function loadOrthographies(): Promise<OrthographyDictionary | void> {
  return await fetch('data/other_sources/hyperglot.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1)
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) => {
      const result: OrthographyDictionary = {};

      lines.forEach((line) => {
        const parts = line.split('\t');
        const languageCode = parts[0];
        const scriptCode = parts[1];
        const rawCharacters = parts[2]?.replace(/\p{Lu}/gu, '');
        if (!languageCode || !scriptCode || !rawCharacters) return;

        const charsArray = Array.from(rawCharacters);
        const baseCharactersArray: string[] = [];

        for (let i = 0; i < charsArray.length; i++) {
          if (charsArray[i] === '\\' && i + 1 < charsArray.length) {
            const multiChar = charsArray.slice(i + 1, i + 3).join('');
            baseCharactersArray.push(multiChar);
            i += multiChar.length;
          } else {
            baseCharactersArray.push(charsArray[i]);
          }
        }

        const baseCharacters = baseCharactersArray.join(' ');

        const baseID = `${languageCode}_${scriptCode}`;
        let instanceCount = 1;
        let ID = baseID;
        while (result[ID] != null) {
          if (result[ID].baseCharacters === baseCharacters) return;
          ID = `${baseID}_${++instanceCount}`;
        }

        const nameDisplay = `${languageCode} (${scriptCode})`;
        result[ID] = {
          type: EntityType.Orthography,
          ID,
          codeDisplay: ID,
          nameDisplay,
          names: [nameDisplay],
          instance: instanceCount,

          languageCode,
          scriptCode,
          baseCharacters,
        };
      });

      return result;
    })
    .catch((err) => console.error('Error loading TSV:', err));
}
