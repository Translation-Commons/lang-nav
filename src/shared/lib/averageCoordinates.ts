import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { sumBy } from './setUtils';

/**
 * Computes the average latitude and longitude of a set of languages or territories.
 *
 * Uses a 3D Cartesian coordinate system to account for the rounded shape of the planet,
 * averages, then converts back to lat/long.
 *
 * Coordinates are weighted by the fourth root of the entity's population (for languages) or land area (for territories).
 * Ignores any languages/territories without valid coordinates or population/land area data.
 */
function averageCoordinates(ents: (LanguageData | TerritoryData)[]) {
  const validEnts = ents.filter(
    (child) => child.latitude != null && child.longitude != null && getEntityWeight(child) > 0,
  );
  if (validEnts.length === 0) return { latitude: undefined, longitude: undefined };

  const denominator = sumBy(validEnts, getEntityWeight);
  const weighted3D = validEnts.map((ent) => getWeighted3DCoordinates(ent));
  const weighted3DSum = {
    x: sumBy(weighted3D, (coord) => coord.x) / denominator,
    y: sumBy(weighted3D, (coord) => coord.y) / denominator,
    z: sumBy(weighted3D, (coord) => coord.z) / denominator,
  };
  const hyp = Math.sqrt(weighted3DSum.x ** 2 + weighted3DSum.y ** 2);
  const latitude = Math.atan2(weighted3DSum.z, hyp) * (180 / Math.PI);
  const longitude = Math.atan2(weighted3DSum.y, weighted3DSum.x) * (180 / Math.PI);
  return { latitude, longitude };
}

function getWeighted3DCoordinates(ent: LanguageData | TerritoryData): {
  x: number;
  y: number;
  z: number;
} {
  const weight = getEntityWeight(ent);
  const latRad = (ent.latitude! * Math.PI) / 180;
  const longRad = (ent.longitude! * Math.PI) / 180;
  return {
    x: Math.cos(latRad) * Math.cos(longRad) * weight,
    y: Math.cos(latRad) * Math.sin(longRad) * weight,
    z: Math.sin(latRad) * weight,
  };
}

function getEntityWeight(ent: LanguageData | TerritoryData): number {
  if (ent.type === ObjectType.Language) return (ent.populationEstimate || 0) ** 0.25;
  if (ent.type === ObjectType.Territory) return (ent.landArea || 0) ** 0.25;
  return 1;
}

export default averageCoordinates;
