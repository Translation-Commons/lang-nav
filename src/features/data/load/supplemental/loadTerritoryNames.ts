import { TerritoryData } from '@entities/territory/TerritoryTypes';

/** Splits a semicolon-separated column, drops entries that repeat one of
 *  `exclude` and duplicates within the column itself, and returns undefined
 *  rather than an empty array - matching parseApiTerritory's treatment of the
 *  same data (nameOtherEndonyms excludes only the endonym, nameOtherExonyms
 *  only the display name - an "other endonym" equal to the display name is
 *  legitimate, e.g. a territory whose local-language name coincides with its
 *  English one), so a name doesn't appear twice under "other names" in the
 *  UI. */
function otherNames(
  raw: string | undefined,
  exclude: (string | undefined)[],
): string[] | undefined {
  if (!raw) return undefined;
  const names = [...new Set(raw.split(';').map((s) => s.trim()))].filter(
    (name) => !exclude.includes(name),
  );
  return names.length > 0 ? names : undefined;
}

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
        territory.nameOtherEndonyms = otherNames(parts[4], [territory.nameEndonym]);
        territory.nameOtherExonyms = otherNames(parts[5], [territory.nameDisplay]);
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
