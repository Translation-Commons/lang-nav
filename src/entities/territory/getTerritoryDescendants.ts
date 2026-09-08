import { TerritoryData } from './TerritoryTypes';

function getTerritoryDescendants(
  territory: TerritoryData,
  includeDependencies: boolean,
): TerritoryData[] {
  const children = territory.containsTerritories ?? [];
  if (includeDependencies) {
    const dependencies = territory.dependentTerritories ?? [];
    children.push(...dependencies);
  }
  return [...children, ...children.flatMap((t) => getTerritoryDescendants(t, includeDependencies))];
}

export default getTerritoryDescendants;
