import type { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import type { LanguagesBySource } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import type { OrthographyData } from '@entities/orthography/OrthographyTypes';
import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import type { TerritoryData } from '@entities/territory/TerritoryTypes';
import type { VariantData } from '@entities/variant/VariantTypes';
import type { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { computeDescendantPopulation } from '../compute/computeDescendantPopulation';
import { searchLocalesForMissingLinks } from '../compute/searchLocalesForMissingLinks';
import { connectVariants } from '../load/extra_entities/IANAData';

import { connectKeyboards } from './connectKeyboards';
import { connectLanguagesToParent } from './connectLanguagesToParent';
import connectLocales from './connectLocales';
import { connectOrganizations } from './connectOrganizations';
import { connectOrthographies } from './connectOrthographies';
import { connectTechnologies } from './connectTechnologies';
import { connectTerritoriesToParent } from './connectTerritoriesToParent';
import { connectWritingSystems } from './connectWritingSystems';
import { createFamilyLocales } from './createFamilyLocales';
import { createRegionalLocales } from './createRegionalLocales';

/**
 * During the core data loading process, after all entities have been loaded, this function connects them together.
 *
 * It also creates some additional derived entities, such as family locales and regional locales.
 */
export function connectEntitiesAndCreateDerivedData(
  languagesBySource: LanguagesBySource,
  territories: Record<string, TerritoryData>,
  writingSystems: Record<string, WritingSystemData>,
  orthographies: Record<string, OrthographyData>,
  locales: Record<string, LocaleData>,
  variants: Record<string, VariantData>,
  keyboards: Record<string, KeyboardData>,
  organizations: Record<string, OrganizationData>,
  technologies: Record<string, TechnologyData>,
): void {
  connectLanguagesToParent(languagesBySource);
  connectTerritoriesToParent(territories);
  connectWritingSystems(languagesBySource.Combined, territories, writingSystems);
  connectOrthographies(languagesBySource.Combined, writingSystems, Object.values(orthographies));
  connectLocales(languagesBySource.Combined, territories, writingSystems, locales);
  connectVariants(variants, languagesBySource.BCP, locales);
  createFamilyLocales(languagesBySource.Combined, locales); // create them before regional locales
  createRegionalLocales(territories, locales); // create them after connecting them
  searchLocalesForMissingLinks(locales); // try to find missing links after creating new locales
  computeDescendantPopulation(writingSystems);
  connectKeyboards(
    keyboards,
    languagesBySource.Combined,
    languagesBySource.CLDR,
    territories,
    writingSystems,
    variants,
    locales,
    technologies,
  );
  connectOrganizations(organizations, territories);
  connectTechnologies(technologies, organizations);
}
