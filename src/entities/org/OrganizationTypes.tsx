import { ObjectType } from '@features/params/PageParamTypes';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectBase } from '@entities/types/DataTypes';

export interface OrganizationData extends ObjectBase {
  type: ObjectType.Org;
  ID: string; // A stable ID to use with indexing, eg. "org.StatCAN" -- should always be prefixed by `org.` to avoid conflicts and have the short name
  codeDisplay: string; // the short name, no org. prefix eg. "StatCAN"
  nameDisplay: string; // long name eg. "Statistics Canada"
  nameEndonym?: string; // The name of the organization in its own language, eg. "Statistique Canada"

  url?: string;
  collectorType?: CensusCollectorType; // If it collects population data

  parentID?: string;
  hqID?: string;

  parent?: OrganizationData; // Sometimes an organization is contained in another, for instance UN -> UNESCO, Unicode -> CLDR
  children?: OrganizationData[]; // Inverse of parent
  headquarters?: TerritoryData; // The territory that this organization is headquartered in
  censuses: CensusData[]; // The census documents that this organization has collected
}
