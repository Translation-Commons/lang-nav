import { TerritoryData } from '@entities/types/DataTypes';

const DEBUG = false;

export async function loadTerritoryGDPLiteracy(
  getTerritory: (id: string) => TerritoryData | undefined,
): Promise<void> {
  return await fetch('data/territories_gdp_literacy.tsv')
    .then((res) => res.text())
    .then((text) => {
      const SKIP_HEADER_ROWS = 5;
      const newTerritoriesData = text
        .split('\n')
        .slice(SKIP_HEADER_ROWS)
        .map((line) => {
          const parts = line.split('\t');
          return { code: parts[0], gdp: parseInt(parts[1]), literacyPercent: parseFloat(parts[2]) };
        });
      newTerritoriesData.forEach((newTerrData) => {
        const territory = getTerritory(newTerrData.code);
        if (territory == null) {
          // Known exclusive: Antarctica (AQ) intentionally left out because its poorly defined linguistically
          if (DEBUG) console.debug('Loading new territory data. Territory not found', newTerrData);
          return;
        }
        territory.literacyPercent = newTerrData.literacyPercent;
        territory.gdp = newTerrData.gdp;
      });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}
