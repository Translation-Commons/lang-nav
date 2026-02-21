import { isTerritoryGroup, TerritoryData } from '@entities/territory/TerritoryTypes';

import { sumBy } from '@shared/lib/setUtils';

export function computeContainedTerritoryStats(terr: TerritoryData | undefined): void {
  if (!terr) return;

  // Make sure that territories within are computed
  const containsTerritories = terr.containsTerritories ?? [];
  containsTerritories.forEach(computeContainedTerritoryStats);

  // Compute region data that is added up from data within it.
  if (isTerritoryGroup(terr.scope)) {
    const newPopulation = sumBy(containsTerritories, (t) => t.population ?? 0);
    if (newPopulation) terr.population = newPopulation;

    const landArea = sumBy(containsTerritories, (t) => t.landArea ?? 0);
    if (landArea) terr.landArea = landArea;

    computeRegionCoordinates(terr);
  }

  // GDP is easy, just add it up
  terr.gdp ??= containsTerritories.reduce((sum, t) => sum + (t.gdp ?? 0), 0);

  // For literacy we will combine proportional to the population
  terr.literacyPercent ??=
    (containsTerritories.reduce(
      (sum, t) => sum + (t.literacyPercent ?? 0) * (t.population ?? 0),
      0,
    ) ?? 0) / terr.population;
}

/**
 * Compute the coordinates for a region based on the coordinates of the contained territories.
 *
 * Coordinates are weighted by the fourth root of the land area
 */
function computeRegionCoordinates(terr: TerritoryData): void {
  if (terr.ID === '001') {
    // Special case for the world, just set to 0,0
    terr.latitude = 0;
    terr.longitude = 0;
    return;
  }

  const containsTerritories = terr.containsTerritories ?? [];

  const denominator = sumBy(containsTerritories, (t) => (t.landArea ?? 1) ** 0.25);
  const latitude = sumBy(containsTerritories, (t) => (t.latitude ?? 0) * (t.landArea ?? 1) ** 0.25);
  const longitude = sumBy(containsTerritories, (t) => {
    // Handle wrap-around at the international date line
    if (t.longitude != null && t.longitude < -120)
      return (t.longitude + 360) * (t.landArea ?? 1) ** 0.25;

    return (t.longitude ?? 0) * (t.landArea ?? 1) ** 0.25;
  });
  terr.latitude = latitude / denominator;
  terr.longitude = (longitude > 180 ? -360 + longitude : longitude) / denominator;
}
