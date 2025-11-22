import {
  LanguageData,
  LanguageDictionary,
  LanguagesBySource,
  LanguageSource,
  LanguageScope,
} from '@entities/language/LanguageTypes';
import { getLocaleName } from '@entities/locale/LocaleStrings';
import {
  BCP47LocaleCode,
  LocaleData,
  ScriptCode,
  TerritoryCode,
  TerritoryData,
  WritingSystemData,
} from '@entities/types/DataTypes';

const MAX_ISO_LANG_CODE_LENGTH = 3;

export function connectLanguagesToParent(languagesBySource: LanguagesBySource): void {
  // Connect general parents
  Object.values(languagesBySource[LanguageSource.Combined]).forEach((lang) => {
    Object.values(LanguageSource).forEach((source) => {
      const parentCode = lang[source].parentLanguageCode;
      if (parentCode != null) {
        const parent =
          languagesBySource[source][parentCode] ?? languagesBySource.Combined[parentCode];
        if (parent != null) {
          lang[source].parentLanguage = parent;
          if (parent[source].childLanguages == null) parent[source].childLanguages = [];
          parent[source].childLanguages.push(lang);
        }
      }
    });
  });
}

export function connectWritingSystems(
  languages: LanguageDictionary,
  territoriesByCode: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
  // Connect the writing systems their origin language and territory
  Object.values(writingSystems).forEach((writingSystem) => {
    const {
      primaryLanguageCode,
      territoryOfOriginCode,
      parentWritingSystemCode,
      containsWritingSystemsCodes,
    } = writingSystem;
    const language = primaryLanguageCode != null ? languages[primaryLanguageCode] : null;
    const territory =
      territoryOfOriginCode != null ? territoriesByCode[territoryOfOriginCode] : null;
    const parentWritingSystem =
      parentWritingSystemCode != null ? writingSystems[parentWritingSystemCode] : null;

    if (language != null) {
      writingSystem.primaryLanguage = language;
      if (!writingSystem.languages) writingSystem.languages = {};
      writingSystem.languages[language.ID] = language;
      language.writingSystems[writingSystem.ID] = writingSystem;
    }
    if (territory != null) {
      writingSystem.territoryOfOrigin = territory;
    }
    if (parentWritingSystem != null) {
      writingSystem.parentWritingSystem = parentWritingSystem;
      if (!parentWritingSystem.childWritingSystems) parentWritingSystem.childWritingSystems = [];
      parentWritingSystem.childWritingSystems.push(writingSystem);
    }
    if (containsWritingSystemsCodes && containsWritingSystemsCodes.length > 0) {
      writingSystem.containsWritingSystems = containsWritingSystemsCodes
        .map((code) => writingSystems[code])
        .filter(Boolean);
    }
  });

  // Connect languages to their primary writing system
  Object.values(languages).forEach((language) => {
    const { primaryScriptCode } = language;
    if (primaryScriptCode != null) {
      const primaryWritingSystem = writingSystems[primaryScriptCode];
      if (primaryWritingSystem != null) {
        if (!primaryWritingSystem.languages) primaryWritingSystem.languages = {};
        primaryWritingSystem.languages[language.ID] = language;
        if (!primaryWritingSystem.populationUpperBound)
          primaryWritingSystem.populationUpperBound = 0;
        primaryWritingSystem.populationUpperBound += language.populationCited || 0;
        language.primaryWritingSystem = primaryWritingSystem;
        language.writingSystems[primaryWritingSystem.ID] = primaryWritingSystem;
      }
    }
  });
}

/**
 * Connects locales to their languages and territories
 * @param languagesByCode - A map of language codes to LanguageData objects
 * @param territoriesByCode - A map of territory codes to TerritoryData objects
 * @param locales - An array of LocaleData objects
 *
 * @returns - The updated array of LocaleData objects -- with some locales removed, if they were missing a match to a territory or language.
 */
export function connectLocales(
  languages: LanguageDictionary,
  territories: Record<TerritoryCode, TerritoryData>,
  writingSystems: Record<ScriptCode, WritingSystemData>,
  locales: Record<BCP47LocaleCode, LocaleData>,
): void {
  Object.values(locales).forEach((locale) => {
    const territory = locale.territoryCode ? territories[locale.territoryCode] : undefined;
    const language = languages[locale.languageCode];
    const writingSystem = locale.scriptCode ? writingSystems[locale.scriptCode] : undefined;

    if (territory != null) {
      if (!territory.locales) territory.locales = [];
      territory.locales.push(locale);
      locale.territory = territory;
      if (locale.populationSpeaking)
        locale.populationSpeakingPercent =
          (locale.populationSpeaking * 100) / (territory.population || 1);
    }
    if (language != null) {
      language.locales.push(locale);
      locale.language = language;
    }
    if (writingSystem != null) {
      if (!writingSystem.localesWhereExplicit) writingSystem.localesWhereExplicit = [];
      writingSystem.localesWhereExplicit.push(locale);
      locale.writingSystem = writingSystem;

      if (language != null) {
        if (!writingSystem.languages) writingSystem.languages = {};
        writingSystem.languages[language.ID] = language;
        if (language.primaryScriptCode != locale.scriptCode && locale.populationSpeaking != null) {
          if (!writingSystem.populationUpperBound) writingSystem.populationUpperBound = 0;
          writingSystem.populationUpperBound += locale.populationSpeaking;
        }

        // Connect the writing system to the language if not already connected
        if (language.writingSystems[writingSystem.ID] == null)
          language.writingSystems[writingSystem.ID] = writingSystem;
      }
    }

    // Update the locale's display name
    locale.nameDisplay = getLocaleName(locale);
  });
}

/**
 * Recompose the structure of languages, leaving the primary index intact but also
 * creating 4 other indices based on the definitions of languages from ISO, UNESCO, Glottolog, and CLDR
 */
export function groupLanguagesBySource(languages: LanguageDictionary): LanguagesBySource {
  return {
    Combined: languages,
    ISO: Object.values(languages).reduce<LanguageDictionary>((isoLangs, lang) => {
      const code = lang.ISO.code;
      if (code != null && code.length <= MAX_ISO_LANG_CODE_LENGTH) isoLangs[code] = lang;
      return isoLangs;
    }, {}),
    BCP: Object.values(languages).reduce<LanguageDictionary>((bcpLangs, lang) => {
      const code = lang.ISO.code6391 ?? lang.ISO.code;
      if (code != null && code.length <= MAX_ISO_LANG_CODE_LENGTH) bcpLangs[code] = lang;
      return bcpLangs;
    }, {}),
    UNESCO: Object.values(languages).reduce<LanguageDictionary>((unescoLangs, lang) => {
      const code = lang.UNESCO.code;
      if (code != null && lang.viabilityConfidence != null && lang.viabilityConfidence != 'No')
        unescoLangs[code] = lang;
      return unescoLangs;
    }, {}),
    Glottolog: Object.values(languages).reduce<LanguageDictionary>((glottoLangs, lang) => {
      const code = lang.Glottolog.code;
      if (code != null) glottoLangs[code] = lang;
      return glottoLangs;
    }, {}),
    CLDR: Object.values(languages).reduce<LanguageDictionary>((cldrLangs, lang) => {
      const code = lang.ISO.code6391 ?? lang.ISO.code;
      if (
        code != null &&
        lang.scope !== LanguageScope.Family &&
        code.length <= MAX_ISO_LANG_CODE_LENGTH
      )
        cldrLangs[code] = lang;
      return cldrLangs;
    }, {}),
  };
}

export function computeOtherPopulationStatistics(
  languagesBySource: LanguagesBySource,
  writingSystems: Record<ScriptCode, WritingSystemData>,
): void {
  // Organizing writing systems by population is a bit funny because some fundamental writing systems
  // like Egyptian have no people but writing systems that descend from then certainly do. Thereby we
  // separately compute an upper bound for how many people speak the descendents. This is safe
  // recursively because the writing system lineage is not a cycle.
  Object.values(writingSystems)
    .filter((writingSystem) => writingSystem.parentWritingSystem == null)
    .forEach(computeWritingSystemDescendentPopulation);

  // Need to compute the language descendent populations 3 times because nodes will be organized
  // differently in the different language sources
  Object.values(LanguageSource).forEach((source) => {
    Object.values(languagesBySource[source])
      .filter((lang) => lang[source].parentLanguage == null) // start at roots
      .forEach((lang) => computeLanguageDescendentPopulation(lang, source));
  });
}

function computeWritingSystemDescendentPopulation(writingSystem: WritingSystemData): number {
  const { childWritingSystems } = writingSystem;
  const descendentPopulation =
    childWritingSystems?.reduce(
      (total, childSystem) => total + computeWritingSystemDescendentPopulation(childSystem),
      0,
    ) || 0;
  writingSystem.populationOfDescendents = descendentPopulation || undefined;
  return descendentPopulation + (writingSystem.populationUpperBound ?? 0);
}

function computeLanguageDescendentPopulation(lang: LanguageData, source: LanguageSource): number {
  const childLanguages = lang[source].childLanguages ?? [];
  const descendentPopulation = childLanguages.reduce(
    (total, childLang) => total + computeLanguageDescendentPopulation(childLang, source),
    1,
  );
  lang[source].populationOfDescendents = descendentPopulation;
  return Math.max(lang.populationCited || 0, descendentPopulation) + 1; // Tiebreaker = number of child nodes
}
