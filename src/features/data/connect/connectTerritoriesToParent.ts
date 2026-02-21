import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';

export function connectTerritoriesToParent(
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
): void {
  Object.values(territoriesByCode).forEach((territory) => {
    // Connect UN regions
    if (territory.containedUNRegionCode) {
      const containedUNRegion = territoriesByCode[territory.containedUNRegionCode];
      if (containedUNRegion != null) {
        if (!containedUNRegion.containsTerritories) {
          containedUNRegion.containsTerritories = [];
        }
        containedUNRegion.containsTerritories.push(territory);
        territory.parentUNRegion = containedUNRegion;
      }
    }
    // Connect dependencies to sovereigns
    if (territory.sovereignCode) {
      const sovereign = territoriesByCode[territory.sovereignCode];
      if (sovereign != null) {
        if (!sovereign.dependentTerritories) {
          sovereign.dependentTerritories = [];
        }
        sovereign.dependentTerritories.push(territory);
        territory.sovereign = sovereign;
      }
    }
  });
}
