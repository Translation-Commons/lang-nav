import { LanguageCode } from '@entities/language/LanguageTypes';
import { LanguageOrthography } from '@entities/orthography/OrthographyTypes';

export async function loadOrthographies(): Promise<Record<LanguageCode, LanguageOrthography[]> | void> {
    return await fetch('data/orthographies/hyperglot.tsv')
        .then((res) => res.text())
        .then((text) =>
            text
                .split('\n')
                .slice(1) // Remove the header row
                .filter((line) => line.trim() !== '' && !line.startsWith('#')),
        )
        .then((lines) => {
            const result: Record<LanguageCode, LanguageOrthography[]> = {};

            lines.forEach((line) => {
                const parts = line.split('\t');
                const code = parts[0];
                const scriptName = parts[1];
                const baseCharacters = parts[2];
                if (!code || !scriptName || !baseCharacters) return;

                if (!result[code]) result[code] = [];
                result[code].push({ scriptName, baseCharacters });
            });

            return result;
        })
        .catch((err) => console.error('Error loading TSV:', err));
}