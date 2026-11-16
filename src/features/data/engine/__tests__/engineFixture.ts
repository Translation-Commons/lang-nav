import Field from '@features/transforms/fields/Field';

import { EntityType } from '@entities/types/EntityTypes';

import { buildEnumIndexJson } from '../indexes/EnumIndex';
import { buildCsrJson, pushUniqueRow } from '../indexes/Postings';
import { buildStringIndexJson } from '../indexes/StringIndex';
import { switchToVariant } from '../load/loadSnapshot';
import { relinkBaseSnapshot } from '../load/relink';
import {
  type BaseSnapshotJson,
  ConnectionKind,
  type DerivedTypeJson,
  EnumKind,
  type PatchJson,
  SearchColumn,
  SNAPSHOT_FORMAT,
} from '../snapshot/SnapshotTypes';
import type { EntityStore } from '../store/EntityStore';

export type FixtureLanguage = {
  ID: string;
  name: string;
  names?: string[];
  population?: number;
  countries?: number;
  scope?: number;
  territories?: string[];
  isoName?: string;
};

export const TERRITORIES = [
  { ID: 'IN', name: 'India' },
  { ID: 'ID', name: 'Indonesia' },
  { ID: 'DE', name: 'Germany' },
];

const APPLICABLE = {
  [ConnectionKind.Territory]: true,
  [ConnectionKind.Language]: false,
  [ConnectionKind.LanguageFamily]: false,
  [ConnectionKind.WritingSystem]: false,
};

type Row = { ID: string; nameDisplay: string; codeDisplay: string; names: string[] };

function deriveType(rows: Row[], extra: Partial<DerivedTypeJson>): DerivedTypeJson {
  const noEnums = buildEnumIndexJson(rows.map(() => 'pass' as const));
  return {
    codes: rows.map((r) => r.codeDisplay),
    search: {
      [SearchColumn.Names]: buildStringIndexJson(rows.map((r) => r.names)),
      [SearchColumn.Code]: buildStringIndexJson(rows.map((r) => [r.codeDisplay])),
      [SearchColumn.Display]: buildStringIndexJson(rows.map((r) => [r.nameDisplay])),
      [SearchColumn.Endonym]: buildStringIndexJson(rows.map(() => [])),
    },
    connections: {},
    enums: Object.fromEntries(
      Object.values(EnumKind).map((k) => [k, noEnums]),
    ) as DerivedTypeJson['enums'],
    population: rows.map(() => null),
    sortKeys: { [Field.Name]: rows.map((r) => r.nameDisplay) },
    orders: {},
    ...extra,
  };
}

function languageRows(languages: FixtureLanguage[], renames: Record<string, string>): Row[] {
  return languages.map((lang) => {
    const name = renames[lang.ID] ?? lang.name;
    return {
      ID: lang.ID,
      nameDisplay: name,
      codeDisplay: lang.ID,
      names: [name, ...(lang.names ?? [])],
    };
  });
}

function deriveLanguages(languages: FixtureLanguage[], rows: Row[]): DerivedTypeJson {
  const byTerritory: number[][] = [];
  languages.forEach((lang, row) =>
    (lang.territories ?? []).forEach((id) =>
      pushUniqueRow(
        byTerritory,
        TERRITORIES.findIndex((t) => t.ID === id),
        row,
      ),
    ),
  );
  byTerritory.length = TERRITORIES.length;
  const base = deriveType(rows, {});
  return {
    ...base,
    connections: { [ConnectionKind.Territory]: buildCsrJson(byTerritory) },
    enums: {
      ...base.enums,
      [EnumKind.LanguageScope]: buildEnumIndexJson(languages.map((l) => [l.scope ?? 3])),
    },
    population: languages.map((l) => l.population ?? null),
    sortKeys: {
      ...base.sortKeys,
      [Field.Population]: languages.map((l) => l.population ?? null),
      [Field.CountOfCountries]: languages.map((l) => l.countries ?? null),
    },
  };
}

function buildBase(languages: FixtureLanguage[]): BaseSnapshotJson {
  return {
    format: SNAPSHOT_FORMAT,
    baseSource: 'Combined',
    localeSeparator: '_',
    types: [
      {
        type: EntityType.Language,
        queryable: languages.length,
        applicable: APPLICABLE,
        records: languageRows(languages, {}).map((r, row) => ({
          type: EntityType.Language,
          ...r,
          ISO: { name: languages[row].isoName },
          territory: { $: [1, 0] },
        })),
      },
      {
        type: EntityType.Territory,
        queryable: TERRITORIES.length,
        applicable: { ...APPLICABLE, [ConnectionKind.Territory]: false },
        records: TERRITORIES.map((t) => ({
          type: EntityType.Territory,
          ID: t.ID,
          nameDisplay: t.name,
          codeDisplay: t.ID,
          names: [t.name],
        })),
      },
    ],
    aliases: [['india', 1, 0]],
    sortDirections: { [Field.Name]: 1, [Field.Population]: -1, [Field.CountOfCountries]: -1 },
    populationDefaults: { min: -1, max: 10_000_000_000 },
  };
}

/** Store with a Combined variant and an ISO variant that renames some languages. */
export function buildFixtureStore(
  languages: FixtureLanguage[],
  isoRenames: Record<string, string> = {},
): EntityStore {
  const base = buildBase(languages);
  const store = relinkBaseSnapshot(base, {
    format: SNAPSHOT_FORMAT,
    createdAt: '',
    baseSource: 'Combined',
    base: { path: 'base.json', hash: '', bytes: 0 },
    variants: {},
    stats: {},
  });
  const territoryDerived = deriveType(
    TERRITORIES.map((t) => ({ ID: t.ID, nameDisplay: t.name, codeDisplay: t.ID, names: [t.name] })),
    {},
  );
  const addVariant = (source: string, renames: Record<string, string>) => {
    const patches: PatchJson[] = languages
      .map((lang, row): PatchJson | undefined =>
        renames[lang.ID] ? [row, { nameDisplay: renames[lang.ID] }] : undefined,
      )
      .filter((patch): patch is PatchJson => patch != null);
    const derived = [
      deriveLanguages(languages, languageRows(languages, renames)),
      territoryDerived,
    ];
    store.variants.set(source, {
      json: { format: SNAPSHOT_FORMAT, source, patches: [patches, []], derived },
      patchesDecoded: false,
    });
  };
  addVariant('Combined', {});
  addVariant('ISO', isoRenames);
  switchToVariant(store, 'Combined');
  return store;
}
