import { EntityType } from '@entities/types/EntityTypes';

export const SNAPSHOT_FORMAT = 1;
export const MANIFEST_PATH = 'manifest.json';

/** Type index used in references; the base snapshot stores the order that was actually used. */
export const TYPE_ORDER: EntityType[] = Object.values(EntityType);

export enum ConnectionKind {
  Territory = 'territory',
  Language = 'language',
  LanguageFamily = 'languageFamily',
  WritingSystem = 'writingSystem',
}

/** Entity type each connection filter matches against. */
export const CONNECTION_TARGET: Record<ConnectionKind, EntityType> = {
  [ConnectionKind.Territory]: EntityType.Territory,
  [ConnectionKind.Language]: EntityType.Language,
  [ConnectionKind.LanguageFamily]: EntityType.Language,
  [ConnectionKind.WritingSystem]: EntityType.WritingSystem,
};

export enum EnumKind {
  LanguageScope = 'languageScope',
  TerritoryScope = 'territoryScope',
  Modality = 'modality',
  ISOStatus = 'isoStatus',
  LanguageSource = 'languageSource',
}

export enum SearchColumn {
  Names = 'names',
  Code = 'code',
  Display = 'display', // nameDisplay, also used to resolve connection filters by name
  Endonym = 'endonym',
}

export type EnumValue = string | number;

/** Compressed sparse rows: rows for key k are r[o[k]..o[k+1]). */
export type CsrJson = { o: number[]; r: number[] };

export type StringIndexJson = {
  tokens: string[];
  tokenRows: CsrJson;
  fulls: string[];
  fullRows: CsrJson;
};

export type EnumIndexJson = { pass: number[]; values: [EnumValue, number[]][] };

export type DerivedTypeJson = {
  codes: (string | null)[];
  search: Record<SearchColumn, StringIndexJson>;
  connections: Partial<Record<ConnectionKind, CsrJson>>;
  enums: Record<EnumKind, EnumIndexJson>;
  population: unknown[];
  sortKeys: Record<string, unknown[]>;
  orders: Record<string, number[]>;
};

/** Columns stored in a non-base variant may be omitted and inherited from the base variant. */
export type VariantDerivedJson = Partial<DerivedTypeJson> & { inherits?: string[] };

export type EncodedRecord = Record<string, unknown>;

export type TypeSnapshotJson = {
  type: EntityType;
  queryable: number;
  applicable: Record<ConnectionKind, boolean>;
  records: EncodedRecord[];
};

export type PopulationDefaults = { min: number; max: number };

export type BaseSnapshotJson = {
  format: number;
  baseSource: string;
  localeSeparator: string;
  types: TypeSnapshotJson[];
  aliases: [key: string, typeIndex: number, row: number][];
  sortDirections: Record<string, number>;
  populationDefaults: PopulationDefaults;
};

export type PatchJson = [row: number, set: EncodedRecord, deleted?: string[]];

export type VariantSnapshotJson = {
  format: number;
  source: string;
  patches: PatchJson[][];
  derived: VariantDerivedJson[];
};

export type SnapshotFileRef = { path: string; hash: string; bytes: number };

export type SnapshotManifest = {
  format: number;
  createdAt: string;
  baseSource: string;
  base: SnapshotFileRef;
  variants: Record<string, SnapshotFileRef>;
  stats: Record<string, number>;
};
