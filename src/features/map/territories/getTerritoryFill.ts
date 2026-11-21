import type { ExpressionSpecification } from 'maplibre-gl';

import DrawableData from '../DrawableData';
import { resolveCssColor } from '../style/resolveCssColor';

type FillOptions = {
  territoryIds: string[];
  entitiesByTerritory: Record<string, DrawableData[]>;
  getColor: ((ent: DrawableData) => string | undefined) | null;
  colors: { primary: string; secondary: string; noData: string };
};

/**
 * Paint for the country shapes: countries in the current results take their entity's colour
 * (or the primary colour when not colouring), the rest are greyed out.
 */
function getTerritoryFill({ territoryIds, entitiesByTerritory, getColor, colors }: FillOptions): {
  color: ExpressionSpecification | string;
  opacity: ExpressionSpecification | number;
} {
  const colorCases: string[] = [];
  const shownIds: string[] = [];
  territoryIds.forEach((territoryId) => {
    const ent = entitiesByTerritory[territoryId]?.[0];
    if (!ent) return;
    shownIds.push(territoryId);
    const color = getColor ? getColor(ent) : colors.primary;
    colorCases.push(territoryId, color ? resolveCssColor(color) : colors.secondary);
  });

  if (shownIds.length === 0) return { color: colors.noData, opacity: 0.8 };
  return {
    color: [
      'match',
      ['get', 'iso'],
      ...colorCases,
      colors.noData,
    ] as unknown as ExpressionSpecification,
    opacity: ['match', ['get', 'iso'], shownIds, 1, 0.8],
  };
}

export default getTerritoryFill;
