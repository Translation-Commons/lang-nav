import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

export function connectOrganizations(
  organizations: Record<string, OrganizationData>,
  territoriesByCode: Record<string, TerritoryData>,
): void {
  Object.values(organizations).forEach((org) => {
    const { hqID, parentID } = org;
    if (hqID != null) {
      const territory = territoriesByCode[hqID] ?? null;
      if (territory != null) org.headquarters = territory;
    }
    if (parentID != null) {
      const parent = organizations[parentID] ?? null;
      if (parent != null) {
        org.parent = parent;
        if (parent.children == null) parent.children = [];
        parent.children.push(org);
      }
    }
  });
}
