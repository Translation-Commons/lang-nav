import { TerritoryScope } from '@entities/territory/TerritoryTypes';

export function getTerritoryScopeLabel(scope?: TerritoryScope): string {
  if (scope == null) return 'Territory';

  switch (scope) {
    case TerritoryScope.World:
      return 'World';
    case TerritoryScope.Continent:
      return 'Continent';
    case TerritoryScope.Region:
      return 'Region';
    case TerritoryScope.Subcontinent:
      return 'Sub-continent';
    case TerritoryScope.Country:
      return 'Country';
    case TerritoryScope.Dependency:
      return 'Dependency';
    default:
      return 'Territory';
  }
}

export function parseTerritoryScope(scope: string): TerritoryScope | undefined {
  switch (scope.trim().toLowerCase()) {
    case 'world':
    case '6': // Numeric value if converted from enum
      return TerritoryScope.World;
    case 'continent':
    case '5':
      return TerritoryScope.Continent;
    case 'region':
    case '4':
      return TerritoryScope.Region;
    case 'sub-continent':
    case 'subcontinent':
    case '3':
      return TerritoryScope.Subcontinent;
    case 'country':
    case '2':
      return TerritoryScope.Country;
    case 'dependency':
    case '1':
      return TerritoryScope.Dependency;
    case '':
    case '0':
      return undefined;
    default:
      console.debug(`Unknown territory scope encountered: ${scope}`);
      return undefined;
  }
}
