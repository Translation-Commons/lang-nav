import { EntityType } from '@features/params/PageParamTypes';

import { VariantData, VariantDictionary, VariantType } from '@entities/variant/VariantTypes';

import { toDictionary, unique } from '@shared/lib/setUtils';

import { fetchFromApi } from './apiConfig';

/** One `entity_name` row. */
type ApiEntityName = {
  kind: string;
  name: string;
};

/** The embedded `entity` row. */
type ApiEntity = {
  name_display: string;
  entity_name: ApiEntityName[];
};

type ApiVariantPrefix = {
  prefix: string;
};

export type ApiVariant = {
  id: string;
  description: string | null;
  date_added: string | null;
  variant_type: string | null;
  equivalent_language_id: string | null;
  entity: ApiEntity;
  variant_prefix: ApiVariantPrefix[];
};

const VARIANT_QUERY =
  '/variant?select=id,description,date_added,variant_type,equivalent_language_id,' +
  'entity(name_display,entity_name(kind,name)),variant_prefix(prefix)' +
  '&entity.entity_name.order=id.asc&order=id.asc';

export async function loadVariantsFromApi(): Promise<VariantDictionary | void> {
  try {
    const rows = await fetchFromApi<ApiVariant[]>(VARIANT_QUERY);
    return toDictionary(rows.map(parseApiVariant), (v) => v.ID);
  } catch (err) {
    console.error('Error loading variants from the API:', err);
    return undefined;
  }
}

export function parseApiVariant(row: ApiVariant): VariantData {
  const ianaTag = row.id;
  const nameDisplay = row.entity.name_display;
  const prefixes = row.variant_prefix.map((vp) => vp.prefix);

  // Exact same extraction logic as loadIANAVariants.ts
  const languageCodes = unique(prefixes.map((l) => l.split(/\W/)[0]));
  const localeCodes = prefixes.map((l) => l + '-' + ianaTag);

  // Date parsing logic matching old code
  let dateAdded: Date | undefined;
  if (row.date_added) {
    // The database returns 'YYYY-MM-DD'. In JS new Date('YYYY-MM-DD') creates UTC midnight.
    // This perfectly matches what the old code did with the string from the IANA file.
    dateAdded = new Date(row.date_added);
  }

  // The ETL writes "o" for Orthographic and "d" for Dialect
  let variantType: VariantType | undefined;
  if (row.variant_type === 'o') variantType = VariantType.Orthographic;
  if (row.variant_type === 'd') variantType = VariantType.Dialect;

  // All names combined for search (distinct to remove duplicates)
  const names = Array.from(new Set([nameDisplay, ...row.entity.entity_name.map((n) => n.name)]));

  return {
    type: EntityType.Variant,
    ID: ianaTag,
    codeDisplay: ianaTag,
    nameDisplay,
    names,
    description: row.description ?? '',
    dateAdded,
    prefixes,
    languageCodes,
    localeCodes,
    variantType,
    ...(row.equivalent_language_id ? { equivalentLanguageCode: row.equivalent_language_id } : {}),

    // Default arrays from the interface
    languages: [],
    locales: [],
    equivalentLanguage: undefined,
  };
}
