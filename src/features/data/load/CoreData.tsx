import { useMemo, useState } from 'react';

import {
  addIANAVariantLocales,
  loadIANAVariants,
} from '@features/data/load/extra_entities/IANAData';
import { EntityType } from '@features/params/PageParamTypes';

import { CensusData, CensusID } from '@entities/census/CensusTypes';
import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LanguageData, LanguagesBySource } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';
import { VariantData } from '@entities/variant/VariantTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { connectEntitiesAndCreateDerivedData } from '../compute/connectEntities';
import { groupLanguagesBySource } from '../connect/connectLanguages';

import { isApiEnabled } from './api/apiConfig';
import { loadKeyboardsGBoard } from './entities/loadKeyboardsGBoard';
import { loadKeyboardsKeyman } from './entities/loadKeyboardsKeyman';
import { loadLanguages } from './entities/loadLanguages';
import { loadLocales } from './entities/loadLocales';
import { loadOrganizations } from './entities/loadOrganizations';
import { loadTerritories } from './entities/loadTerritories';
import { loadWritingSystems } from './entities/loadWritingSystems';
import {
  applyCombinedFamilyOverrides,
  loadCombinedFamilyOverrides,
} from './extra_entities/CombinedFamilyOverrides';
import {
  addGlottologLanguages,
  loadGlottocodeToISO,
  loadGlottologLanguages,
} from './extra_entities/GlottologData';
import {
  addISODataToLanguages,
  addISOLanguageFamilyData,
  addISOMacrolanguageData,
  getUniqueISO6392bLanguages,
  loadISOFamiliesToLanguages,
  loadISOLanguageFamilies,
  loadISOLanguages,
  loadISOMacrolanguages,
} from './extra_entities/ISOData';
import { addISORetirementsToLanguages, loadISORetirements } from './extra_entities/ISORetirements';
import { addCLDRLanguageDetails } from './supplemental/UnicodeData';

export type CoreDataArrays = {
  allLanguoids: LanguageData[]; // Using the technical term here since some of these are language groups or subsets
  locales: LocaleData[];
  territories: TerritoryData[];
  variants: VariantData[];
  writingSystems: WritingSystemData[];
  keyboards: KeyboardData[];
  censuses: Record<CensusID, CensusData>;
  organizations: OrganizationData[];
};

export type CoreData = CoreDataArrays & {
  ents: Record<string, EntityData>;
};

export const EMPTY_LANGUAGES_BY_SCHEMA: LanguagesBySource = {
  Combined: {},
  ISO: {},
  BCP: {},
  Glottolog: {},
  UNESCO: {},
  CLDR: {},
};

/**
 * Get core data needed to show the tables -- things like language codes, relationships with other languages.
 */

export function useCoreData(): {
  loadCoreData: () => Promise<void>;
  coreData: CoreData;
} {
  const [allLanguoids, setAllLanguoids] = useState<LanguageData[]>([]);
  const [ents, setEnts] = useState<Record<string, EntityData>>({});

  // Censuses are not populated here, but this seems necessary because the state affects the page.
  const [censuses, setCensuses] = useState<Record<CensusID, CensusData>>({});

  async function loadCoreData(): Promise<void> {
    const [
      initialLangs,
      isoLangs,
      macroLangs,
      langFamilies,
      isoLangsToFamilies,
      isoRetirements,
      glottologImport,
      glottocodeToISO,
      combinedFamilyOverrides,
      territories,
      locales,
      writingSystems,
      variants,
      keyboardsGBoard,
      keyboardsKeyman,
      organizations,
    ] = await Promise.all([
      loadLanguages(),
      // FOUR of the eight language files are skipped when the API is on, and
      // the other four are not. Which is which was settled by measurement, not
      // by reading: each file was withheld from the API path in turn and the
      // result diffed against the full file path, since the question is never
      // "does the database hold this data" but "does a LATER step overwrite
      // what the database supplied".
      //
      // ALL LANGUAGE DATA COMES FROM THE DATABASE. The four files below run
      // transformations; they do not carry facts the API lacks. See the note
      // above that list.
      //
      // SKIPPED - withholding these changes nothing:
      //
      //  - iso-639-3.tab. It supplied ISO/BCP/UNESCO/CLDR codes, names, scopes
      //    and 639-1/639-2b codes - 31,866 field differences before the loader
      //    sent them. They are all columns of `language_source_attribute`, and
      //    the query now selects them.
      //  - families639-5.tsv. Family names, scopes and parents, 230 of them,
      //    likewise now carried on the ISO and BCP attribute rows.
      //  - macrolanguages.tsv. addISOMacrolanguageData assigns NOTHING: every
      //    branch of it is a console.debug behind `DEBUG = false`.
      //  - familiesToLanguages.tsv. It lists members by their ISO 639-1 code
      //    where they have one - `zhx` contains `zh`, not `zho` - and the ETL
      //    read the cell literally, so 182 of those edges were dropped and
      //    `zho` had no ISO parent at all. The loader now resolves each member
      //    through the 639-1 alias first, exactly as the frontend resolves it
      //    through languagesBySource.BCP, and the edges are in the database.
      //
      // KEPT - and THE DATABASE HOLDS EVERY FACT THESE FOUR FILES CONTAIN.
      //
      // That is worth stating plainly, because the obvious reading of this list
      // is "four columns still missing" and it is wrong. Verified against a
      // loaded database: language_retirement has all 388 retirement rows with
      // their remedy text and effective dates, language_code_alias has all
      // 9,157 glottocode and ISO aliases, and 69 attribute rows carry
      // is_manual_override for the override file. Nothing here is waiting on a
      // schema change.
      //
      // What these four still supply is LOGIC, not data: a display rule, a
      // browser-only convention, and two files that repair what the other two
      // overwrite. Reproducing them in the mapper means reproducing the ORDER
      // in which CoreData mutates the dictionaries, and that is what defeats
      // it - groupLanguagesBySource runs BEFORE the retirement step and AFTER
      // the mapper, so a glottocode the mapper must supply for the dictionary
      // to register it is the same glottocode the end state must not have.
      //
      // Measured, on the file path: of 26,740 Combined parents, exactly ONE
      // points at a languoid the Combined dictionary does not hold. So the two
      // trees are not far apart - what differs is which layer applies the rule,
      // not what the answer is.
      //
      // Five parallel requests is the deliberate stopping point. These files
      // are static, CDN-cacheable and about 755 KB gzipped, against a query
      // that already sends 16 MB raw to absorb the three that did move. The
      // remaining saving is round trips at page load, and it is not worth
      // changing what the Combined tree means to collect it.
      //
      //  - iso-639-3_Retirements.tab DELETES retired codes from the ISO, BCP,
      //    CLDR and UNESCO dictionaries and rebuilds their Combined entry from
      //    scratch. The database keeps those languoids fully populated - `ajp`
      //    has a name, a scope and a parent in every source - because stripping
      //    them is a display decision, not a fact about the data. No payload
      //    can express a deletion the receiver is supposed to perform.
      //  - glottolog.tsv sets Combined.parentLanguageCode to a GLOTTOCODE
      //    (`kor` -> `kore1284`). The database deliberately never writes that:
      //    there a parent is a foreign key, so the same value grafts the
      //    Glottolog forest onto the Combined tree - language_ancestry 281k ->
      //    477k, D10 failing on 994 rows.
      //  - glottocodeToISO.tsv and languageFamilyCombinedOverrides.tsv are both
      //    RESTORATIVE. They run after addGlottologLanguages and put back what
      //    it overwrote. `cca` is the clearest case: the API delivers its
      //    Combined parent `sai` correctly, addISORetirementsToLanguages then
      //    replaces the whole languoid because `cca` is retired with no
      //    changeTo, and the overrides file is what restores `sai`. Load-
      //    bearing for exactly as long as the two steps before them run.
      isApiEnabled() ? Promise.resolve([]) : loadISOLanguages(),
      isApiEnabled() ? Promise.resolve([]) : loadISOMacrolanguages(),
      isApiEnabled() ? Promise.resolve([]) : loadISOLanguageFamilies(),
      isApiEnabled() ? Promise.resolve({}) : loadISOFamiliesToLanguages(),
      loadISORetirements(),
      loadGlottologLanguages(),
      loadGlottocodeToISO(),
      loadCombinedFamilyOverrides(),
      loadTerritories(),
      loadLocales(),
      loadWritingSystems(),
      loadIANAVariants(),
      loadKeyboardsGBoard(),
      loadKeyboardsKeyman(),
      loadOrganizations(),
    ]);

    if (
      initialLangs == null ||
      territories == null ||
      locales == null ||
      writingSystems == null ||
      variants == null ||
      keyboardsGBoard == null ||
      keyboardsKeyman == null ||
      organizations == null
    ) {
      alert('Error loading data. Please check the console for more details.');
      return;
    }

    const keyboards = { ...keyboardsGBoard, ...keyboardsKeyman };

    addISODataToLanguages(initialLangs, isoLangs || []);
    const languagesBySource = groupLanguagesBySource(initialLangs);
    addISOLanguageFamilyData(languagesBySource, langFamilies || [], isoLangsToFamilies || {});
    addISOMacrolanguageData(languagesBySource.ISO, macroLangs || []);
    addISORetirementsToLanguages(languagesBySource, isoRetirements || []);
    addGlottologLanguages(languagesBySource, glottologImport || [], glottocodeToISO || {});
    applyCombinedFamilyOverrides(languagesBySource, combinedFamilyOverrides || []);
    addCLDRLanguageDetails(languagesBySource);
    addIANAVariantLocales(languagesBySource.BCP, locales, variants);

    connectEntitiesAndCreateDerivedData(
      languagesBySource,
      territories,
      writingSystems,
      locales,
      variants,
      keyboards,
      organizations,
    );

    setCensuses({}); // Censuses are not loaded here, but this is needed to enable the page updates.
    setAllLanguoids(Object.values(languagesBySource.Combined));

    setEnts({
      // All combined into one big entity map for easy lookup but the ID formats are unique so its OK
      ...languagesBySource.Glottolog, // aaaa0000
      ...languagesBySource.ISO, // aaa
      ...getUniqueISO6392bLanguages(languagesBySource), // ISO 639-2b codes
      ...languagesBySource.BCP, // aa | aaa
      ...languagesBySource.Combined, // A few languages like `mol` aren't in those sets but should still be indexed
      ...territories, // AA | 000
      ...locales, // aa_Aaaa_AA... etc.
      ...writingSystems, // Aaaa
      ...variants, // These may be arbitrary, but usually 6-8 alphabetic
      ...keyboards,
      ...organizations, // These should be prefixed by org.
    });
  }

  const coreData = useMemo(
    () => ({
      allLanguoids,
      locales: Object.values(ents).filter((e): e is LocaleData => e.type === EntityType.Locale),
      territories: Object.values(ents).filter(
        (e): e is TerritoryData => e.type === EntityType.Territory,
      ),
      variants: Object.values(ents).filter((e): e is VariantData => e.type === EntityType.Variant),
      writingSystems: Object.values(ents).filter(
        (e): e is WritingSystemData => e.type === EntityType.WritingSystem,
      ),
      keyboards: Object.values(ents).filter(
        (e): e is KeyboardData => e.type === EntityType.Keyboard,
      ),
      censuses,
      organizations: Object.values(ents).filter(
        (e): e is OrganizationData => e.type === EntityType.Org,
      ),
      ents,
    }),
    [allLanguoids, ents, censuses],
  );

  return {
    loadCoreData,
    coreData,
  };
}
