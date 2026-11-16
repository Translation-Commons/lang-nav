import {
  getLanguageForEntity,
  getTerritoryForEntity,
} from '@features/transforms/fields/getEntityConnection';
import { getLanguageSourcesForEntity } from '@features/transforms/filtering/filterByEnum';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { getEntityPopulation } from '@entities/lib/getEntityPopulation';
import type { EntityData } from '@entities/types/EntityTypes';

import { buildEnumIndexJson } from '../indexes/EnumIndex';
import { encodeNumber } from '../snapshot/snapshotCodec';
import { type EnumIndexJson, EnumKind, type EnumValue } from '../snapshot/SnapshotTypes';

import type { RowTable } from './rowTables';

type EnumValues = EnumValue[] | 'pass';

const optional = (value: EnumValue | undefined | null): EnumValue[] =>
  value == null ? [] : [value];

/**
 * Per entity, the values each enum filter compares against, or 'pass' where the current filter
 * returns true without looking (eg. no language for a language scope filter).
 */
const ENUM_VALUES: Record<EnumKind, (ent: EntityData) => EnumValues> = {
  [EnumKind.LanguageScope]: (ent) => {
    const language = getLanguageForEntity(ent);
    return language ? [language.scope ?? LanguageScope.SpecialCode] : 'pass';
  },
  [EnumKind.Modality]: (ent) => {
    const language = getLanguageForEntity(ent);
    return language ? optional(language.modality) : 'pass';
  },
  [EnumKind.ISOStatus]: (ent) => {
    const language = getLanguageForEntity(ent);
    return language ? optional(language.vitality?.iso) : 'pass';
  },
  [EnumKind.TerritoryScope]: (ent) => {
    const territory = getTerritoryForEntity(ent);
    return territory ? optional(territory.scope) : 'pass';
  },
  [EnumKind.LanguageSource]: (ent) =>
    getLanguageForEntity(ent) ? getLanguageSourcesForEntity(ent) : 'pass',
};

function queryableEntities(table: RowTable): (EntityData | undefined)[] {
  return table.entities.slice(0, table.queryable);
}

export function deriveEnums(table: RowTable): Record<EnumKind, EnumIndexJson> {
  const ents = queryableEntities(table);
  return Object.fromEntries(
    Object.values(EnumKind).map((kind) => [
      kind,
      buildEnumIndexJson(ents.map((ent) => (ent ? ENUM_VALUES[kind](ent) : []))),
    ]),
  ) as Record<EnumKind, EnumIndexJson>;
}

export function derivePopulation(table: RowTable): unknown[] {
  return queryableEntities(table).map((ent) => {
    const population = ent ? getEntityPopulation(ent) : undefined;
    return population == null ? null : encodeNumber(population);
  });
}
