import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';

export function loadLandArea(
  getTerritory: (id: string) => TerritoryData | undefined,
): Promise<void> {
  return fetch('data/wiki/country_land_area.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1) // Remove the header row
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines
        .map((line) => {
          const parts = line.split('\t');
          const code = parts[0] as TerritoryCode;
          const landArea = parseFloat(parts[2].replace(/,/g, ''));
          if (!isNaN(landArea)) return { territoryCode: code, landArea };
          return undefined;
        })
        .filter((entry) => !!entry),
    )
    .then((areas) =>
      areas.forEach((a) => {
        const terr = getTerritory(a.territoryCode);
        if (terr != null) terr.landArea = a.landArea;
      }),
    )
    .catch((err) => console.error('Error loading TSV:', err));
}
