import { TerritoryCode, TerritoryData } from '@entities/types/DataTypes';

export function loadCountryCoordinates(
  getTerritory: (id: string) => TerritoryData | undefined,
): Promise<void> {
  return fetch('data/country-coord.csv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .slice(1)
        .filter((line) => line.trim() !== '' && !line.startsWith('#')),
    )
    .then((lines) =>
      lines
        .map((line) => {
          // Country,Alpha-2 code,Alpha-3 code,Numeric code,Latitude (average),Longitude (average)
          let parts = line.split(',');
          if (parts.length > 6) {
            // Handle commas in country names
            const extraParts = parts.length - 6;
            const countryParts = parts.slice(0, 1 + extraParts);
            const restParts = parts.slice(1 + extraParts);
            parts = [countryParts.join(','), ...restParts];
          }
          const code = parts[1] as TerritoryCode;
          const codeAlpha3 = parts[2];
          const codeNumeric = parts[3] ? parts[3].padStart(3, '0') : undefined;
          const latitude = parseFloat(parts[4]);
          const longitude = parseFloat(parts[5]);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            return { territoryCode: code, codeAlpha3, codeNumeric, latitude, longitude };
          }
          return undefined;
        })
        .filter((entry) => !!entry),
    )
    .then((coords) =>
      coords.forEach((c) => {
        const terr = getTerritory(c.territoryCode);
        if (terr != null) {
          terr.codeAlpha3 = c.codeAlpha3;
          terr.codeNumeric = c.codeNumeric;
          terr.latitude = c.latitude;
          terr.longitude = c.longitude;
        }
      }),
    )
    .catch((err) => console.error('Error loading CSV:', err));
}
