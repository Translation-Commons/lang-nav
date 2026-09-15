import { EntityType } from '@features/params/PageParamTypes';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { fetchFromApi, orUndefined } from './apiConfig';

/**
 * Loads organizations from the API instead of from organizations.tsv.
 *
 * Unlike territories, organizations have no supplemental TSV files layered on
 * top and no derived/rolled-up values to withhold - the mapping here is a
 * straight passthrough of what the ETL already put in the `organization` and
 * `entity` tables.
 */

/** The embedded `entity` row. name_endonym lives here, not on `organization`
 *  itself - it's the only source of an organization's endonym. */
type ApiEntity = {
  name_display: string;
  name_endonym: string | null;
};

export type ApiOrganization = {
  id: string;
  url: string | null;
  collector_type: CensusCollectorType | null;
  parent_id: string | null;
  hq_territory_id: string | null;
  entity: ApiEntity;
};

// id, parent_id and hq_territory_id already arrive in the exact string shape
// the frontend expects (org.-prefixed ids, bare territory codes) - the only
// transform needed anywhere here is stripping the prefix for codeDisplay.
const ORGANIZATION_QUERY =
  '/organization?select=id,url,collector_type,parent_id,hq_territory_id,' +
  'entity(name_display,name_endonym)&order=id.asc';

export async function loadOrganizationsFromApi(): Promise<Record<string, OrganizationData> | void> {
  // Resolves to undefined on failure rather than throwing - loadOrganizations()
  // depends on that to fall back to the TSV file instead of getting stuck.
  try {
    const rows = await fetchFromApi<ApiOrganization[]>(ORGANIZATION_QUERY);
    return toDictionary(rows.map(parseApiOrganization), (org) => org.ID);
  } catch (err) {
    console.error('Error loading organizations from the API:', err);
    return undefined;
  }
}

export function parseApiOrganization(row: ApiOrganization): OrganizationData {
  const nameDisplay = row.entity.name_display;
  const nameEndonym = orUndefined(row.entity.name_endonym);

  return {
    type: EntityType.Org,
    ID: row.id,
    // organization.id is already org.-prefixed, but codeDisplay must not be.
    codeDisplay: row.id.replace(/^org\./, ''),
    nameDisplay,
    nameEndonym,
    // Truthy filter to match parseOrganizationLine, which also drops an empty
    // string here, not just null/undefined.
    names: [nameDisplay, nameEndonym].filter((n): n is string => Boolean(n)),
    url: orUndefined(row.url),
    collectorType: orUndefined(row.collector_type),
    parentID: orUndefined(row.parent_id),
    // parseOrganizationLine has no `|| undefined` fallback for this one field,
    // so an empty Headquarters column comes out as '', not undefined -
    // matching that here instead of using orUndefined.
    hqID: row.hq_territory_id ?? '',
    censuses: [],
  };
}
