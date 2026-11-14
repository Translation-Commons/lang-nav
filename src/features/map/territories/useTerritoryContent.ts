import { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import { getColorGradientFunction } from '@features/transforms/coloring/getColorGradientFunction';

import { EntityType } from '@entities/types/EntityTypes';

import { groupBy } from '@shared/lib/setUtils';

import DrawableData from '../DrawableData';
import { resolveCssColor } from '../style/resolveCssColor';
import type { MapThemeColors } from '../style/useMapThemeColors';

import getTerritoryFill from './getTerritoryFill';

const NO_DATA_GREY = '#bcbcbc';

type Options = {
  drawableEntities: DrawableData[];
  getColor: ((ent: DrawableData) => string | undefined) | null;
  colors: MapThemeColors;
};

/** The country shapes: which ones we know, how they are painted and what each one stands for. */
function useTerritoryContent({ drawableEntities, getColor, colors }: Options) {
  const { entType, colorGradient } = usePageParams();
  const { territories } = useDataContext();

  const entitiesByTerritory = useMemo(
    () =>
      groupBy(drawableEntities, (ent) =>
        ent.type === EntityType.Locale && ent.territory ? ent.territory.ID : ent.ID,
      ),
    [drawableEntities],
  );
  const territoriesById = useMemo(
    () =>
      new Map(
        territories
          // Only countries have two-letter IDs; regions such as Africa [002] have no shape.
          .filter((territory) => territory.ID.length === 2)
          .map((territory) => [territory.ID, territory]),
      ),
    [territories],
  );
  const territoryIds = useMemo(() => [...territoriesById.keys()], [territoriesById]);

  const territoryFill = useMemo(() => {
    const noData =
      entType === EntityType.Locale ? getColorGradientFunction(colorGradient)(0) : NO_DATA_GREY;
    return getTerritoryFill({
      territoryIds,
      entitiesByTerritory,
      getColor,
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        noData: resolveCssColor(noData),
      },
    });
  }, [territoryIds, entitiesByTerritory, getColor, colors, entType, colorGradient]);

  const getTerritoryEntity = useCallback(
    (territoryId: string) => {
      const territory = territoriesById.get(territoryId);
      if (!territory) return null;
      const shownEnt = entitiesByTerritory[territoryId]?.[0];
      return {
        ent: shownEnt ?? territory,
        showData: entType !== EntityType.Locale || shownEnt != null,
      };
    },
    [territoriesById, entitiesByTerritory, entType],
  );

  return { territoryIds, territoryFill, getTerritoryEntity };
}

export default useTerritoryContent;
