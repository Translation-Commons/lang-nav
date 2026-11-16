import type { SearchableField } from '@features/params/PageParamTypes';

import type { LanguageScope, LanguageSource } from '@entities/language/LanguageTypes';
import type { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import type { LanguageModality } from '@entities/language/writing/LanguageModality';
import type { TerritoryScope } from '@entities/territory/TerritoryTypes';
import type { EntityData, EntityType } from '@entities/types/EntityTypes';

import type { SortSpec } from '../indexes/sortOrder';

export type SearchMode = `${SearchableField}`;

/** Same values and meaning as the page params of the same name. Empty or missing means no filter. */
export type QueryFilters = {
  territory?: string;
  language?: string;
  languageFamily?: string;
  writingSystem?: string;
  languageScopes?: LanguageScope[];
  territoryScopes?: TerritoryScope[];
  modalities?: LanguageModality[];
  isoStatuses?: LanguageISOStatus[];
  languageSource?: LanguageSource | `${LanguageSource}`;
  populationMin?: number;
  populationMax?: number;
};

export type Query = {
  type: EntityType;
  filters?: QueryFilters;
  search?: { query: string; by?: SearchMode };
  /** Missing means Field.None: rows keep their input order. */
  sort?: SortSpec;
  pinned?: string[];
  /** 1-indexed like the page param; limit < 1 returns everything. */
  page?: { page: number; limit: number };
};

export type PlanStep = {
  name: string;
  kind: 'index' | 'residual';
  /** Rows matching this step on its own (index) or rows removed by it (residual). */
  count: number;
};

export type QueryResult = {
  /** Total rows before pagination, pinned rows included. */
  total: number;
  ids: string[];
  entities: EntityData[];
  rows: Uint32Array;
  plan: PlanStep[];
  version: number;
};
