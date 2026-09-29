import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';

export function connectTechnologies(
  technologies: Record<string, TechnologyData>,
  organizations: Record<string, OrganizationData>,
): void {
  Object.values(technologies).forEach((tech) => {
    const { relatedTechCodes, parentTechCode, organizationCode } = tech;
    if (parentTechCode != null) {
      const parent = technologies['tech.' + parentTechCode] ?? null;
      if (parent != null) {
        tech.parentTech = parent;
        if (parent.childTechs == null) parent.childTechs = [];
        parent.childTechs.push(tech);
      }
    }

    if (relatedTechCodes != null) {
      tech.relatedTechs = [];
      relatedTechCodes.forEach((relatedID) => {
        const related = technologies['tech.' + relatedID] ?? null;
        if (related != null) {
          if (!tech.relatedTechs) tech.relatedTechs = [];
          tech.relatedTechs.push(related);
          if (!related.relatedTechs) related.relatedTechs = [];
          if (related.relatedTechs.indexOf(tech) === -1) related.relatedTechs.push(tech);
        }
      });
    }

    if (organizationCode != null) {
      const organization = organizations['org.' + organizationCode] ?? null;
      if (organization != null) {
        tech.organization = organization;
        if (organization.techs == null) organization.techs = [];
        organization.techs.push(tech);
      }
    }
  });
}
