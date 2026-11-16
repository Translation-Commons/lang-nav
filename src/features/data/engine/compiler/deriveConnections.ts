import Field from '@features/transforms/fields/Field';
import { isFieldApplicable } from '@features/transforms/fields/FieldApplicability';
import {
  getLanguageFamiliesRelevantToEntity,
  getLanguagesRelevantToEntity,
  getWritingSystemsRelevantToEntity,
} from '@features/transforms/filtering/filterByConnections';
import TransformEnum from '@features/transforms/TransformEnum';

import { getContainingTerritories } from '@entities/lib/getEntityRelatedTerritories';
import type { EntityData, EntityType } from '@entities/types/EntityTypes';

import { buildCsrJson, pushUniqueRow } from '../indexes/Postings';
import { CONNECTION_TARGET, ConnectionKind, type CsrJson } from '../snapshot/SnapshotTypes';

import { getTableFor, type RowTable, type RowTables } from './rowTables';

/** The functions the current connection filters call, so the postings match them exactly. */
const CONNECTIONS: Record<
  ConnectionKind,
  { field: Field; get: (ent: EntityData) => EntityData[] }
> = {
  [ConnectionKind.Territory]: { field: Field.TerritoryList, get: getContainingTerritories },
  [ConnectionKind.Language]: { field: Field.LanguageList, get: getLanguagesRelevantToEntity },
  [ConnectionKind.LanguageFamily]: {
    field: Field.LanguageFamily,
    get: getLanguageFamiliesRelevantToEntity,
  },
  [ConnectionKind.WritingSystem]: {
    field: Field.WritingSystem,
    get: getWritingSystemsRelevantToEntity,
  },
};

export function getConnectionApplicability(type: EntityType): Record<ConnectionKind, boolean> {
  return Object.fromEntries(
    Object.values(ConnectionKind).map((kind) => [
      kind,
      isFieldApplicable(CONNECTIONS[kind].field, TransformEnum.Filter, type),
    ]),
  ) as Record<ConnectionKind, boolean>;
}

/** Inverted lists: for each connected entity's row, the rows of `table` connected to it. */
function deriveConnection(
  rows: RowTables,
  table: RowTable,
  kind: ConnectionKind,
  stats: { missingTargets: number },
): CsrJson {
  const targetTable = getTableFor(rows, CONNECTION_TARGET[kind]);
  const lists: number[][] = [];
  for (let row = 0; row < table.queryable; row++) {
    const ent = table.entities[row];
    if (!ent) continue;
    for (const target of CONNECTIONS[kind].get(ent)) {
      const targetRow = target.type === targetTable.type ? targetTable.rowOf.get(target.ID) : null;
      if (targetRow == null) {
        stats.missingTargets++;
        continue;
      }
      pushUniqueRow(lists, targetRow, row);
    }
  }
  lists.length = targetTable.ids.length;
  return buildCsrJson(lists);
}

export function deriveConnections(
  rows: RowTables,
  table: RowTable,
  stats: { missingTargets: number },
): Partial<Record<ConnectionKind, CsrJson>> {
  const applicable = getConnectionApplicability(table.type);
  const out: Partial<Record<ConnectionKind, CsrJson>> = {};
  for (const kind of Object.values(ConnectionKind)) {
    if (applicable[kind]) out[kind] = deriveConnection(rows, table, kind, stats);
  }
  return out;
}
