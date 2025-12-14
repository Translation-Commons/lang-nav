import { TerritoryData } from '@entities/types/DataTypes';

export function loadTerritoryNames(
  getTerritory: (id: string) => TerritoryData | undefined,
): Promise<void> {
  return fetch('data/wiki/territory_names.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(2) // Remove the header rows
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines.forEach((line) => {
        //   ID	Exonym	Endonym	Endonym Source	Other Endonyms	Other Names
        const parts = line.split('\t');
        const territory = getTerritory(parts[0]);
        if (!territory) return;

        territory.nameEndonym = parts[2] ? parts[2].trim() : undefined;
        territory.nameOtherEndonyms = parts[4]
          ? parts[4].split(';').map((s) => s.trim())
          : undefined;
        territory.nameOtherExonyms = parts[5]
          ? parts[5].split(';').map((s) => s.trim())
          : undefined;
        territory.names = [
          territory.nameDisplay,
          territory.nameEndonym,
          ...(territory.nameOtherEndonyms || []),
          ...(territory.nameOtherExonyms || []),
        ].filter((n) => n != null);
      }),
    )
    .catch((err) => console.error('Error loading TSV:', err));
}
