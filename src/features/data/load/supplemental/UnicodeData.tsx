import aliases from 'cldr-core/supplemental/aliases.json';
import languageMatching from 'cldr-core/supplemental/languageMatching.json';
import territoryInfo from 'cldr-core/supplemental/territoryInfo.json';

import type { DataGetters } from '@features/data/context/useDataContext';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import { setLanguageNames } from '@entities/language/identity/setLanguageNames';
import { LanguageData, LanguageDictionary, LanguageScope } from '@entities/language/LanguageTypes';
import type { LocaleData } from '@entities/locale/LocaleTypes';
import type { CLDRCoverageImport } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';
import { parseCoverageLevel } from '@entities/ui/CLDRCoverageLevels';

const DEBUG = false;

type CLDRLanguageMatchImport = {
  _desired: string;
  _supported: string;
  _distance: number;
  _oneway?: boolean;
};

export function addCLDRLanguageDetails(languages: LanguageDictionary): void {
  // Import the CLDR language aliases and format it a bit
  const languageAliases = Object.entries(aliases.supplemental.metadata.alias.languageAlias).map(
    (alias) => {
      const [code, aliasData] = alias;
      return {
        original: code,
        reason: aliasData._reason,
        replacement: aliasData._replacement,
      };
    },
  );

  // Go through all "overlong" aliases. We already handled most of them by using ISO 639-1 two-letter codes but a few
  // more exist, in particular eg. swc -> sw_CD and prs -> fa_AF
  languageAliases
    .filter(({ reason }) => reason === 'overlong')
    .forEach((alias) => {
      const lang = languages[alias.original];

      // No action is needed if the replacement is just the language's own ISO 639-1 two-letter code
      if (lang.ISO.code6391 === alias.replacement) return;

      // Otherwise find the replacement
      let replacementData: LanguageData | LocaleData = languages[alias.replacement];
      if (replacementData == null) {
        // If the replacement data is not found, it may be a locale -- but we need to convert it to underscored ISO-639-3 form
        // For example, `sw-CD` replaces `swc`, but we need to convert it to `swc_CD` to match out source
        const replacementIdParts = alias.replacement.split('-');
        // TODO need to add the equivalent locales swa_CD, fas_AF, srp_Latn
        // const replacementLangID = cldrLanguages[replacementIdParts[0]]?.ID ?? replacementIdParts[0];
        // replacementData = locales[replacementLangID + '_' + replacementIdParts.slice(1).join('_')];
        replacementData = languages[replacementIdParts[0]];
      }
      if (lang != null) {
        // Add a note that the language code is considered "overlong" and a different language code or locale code should be used instead for CLDR purposes
        lang.CLDR.code = undefined;
        lang.CLDR.notes = (
          <>
            This language code <code>{alias.original}</code> is considered &quot;overlong&quot; in
            CLDR, use <code>{alias.replacement}</code> instead.
          </>
        );
        // Add the replacement code as a child language
        lang.CLDR.dataProvider = replacementData;
        if (DEBUG && replacementData == null) {
          console.warn(
            `CLDR language ${alias.original} has no replacement data for ${alias.replacement}. This may cause issues.`,
          );
        }
      }
      if (DEBUG && lang != null) {
        console.debug('CLDR import', alias, lang);
        // TODO: support locales in CLDR better
      }
    });

  // Then go through the macrolanguage entries.
  // Macrolanguage replacements actually completely replace the parent language
  // For example, "zh" usually means "Chinese (macrolanguage)" but in CLDR it functionally means cmn "Mandarin Chinese"
  // This is because the macrolanguage tag is better known and of the macrolanguage's consistuents, Mandarin Chinese
  // is the most dominant. Thereby, the canonical entry for "cmn" in the langauge data is functionally "zh" in CLDR.
  languageAliases
    .filter((alias) => alias.reason === 'macrolanguage')
    .forEach((alias) => {
      // Get the constituent language and the macrolanguage that will be replaced by it
      const constituentLangCode = alias.original; // eg. `cmn`
      const macroLangCode = alias.replacement; // eg. `zh`
      const constituentLang = languages[alias.original]; // eg. Mandarin Chinese `cmn` in ISO but effective `zh` in CLDR
      const macroLang = languages[alias.replacement]; // eg. Chinese (macrolanguage) `zho`/`zh` in ISO
      if (constituentLang?.ID === macroLang?.ID) {
        console.warn(
          'Constituent language has the same ID as its macrolanguage',
          alias,
          constituentLang,
        );
      }
      const notes = (
        <>
          The ISO language {macroLang?.nameCanonical} <code>{macroLangCode}</code> is a
          macrolanguage -- meaning it is a generalization for multiple languages that, while
          related, have strong lexical or phonological differences. Thereby, CLDR uses it&apos;s
          largest constituent language {constituentLang?.nameCanonical}{' '}
          <code>{constituentLangCode}</code> as the canonical representation for the macrolanguage.
        </>
      );

      // Does the macrolanguage entry exist?
      if (constituentLang != null && macroLang != null) {
        // Add notes to the macrolanguage entry
        macroLang.CLDR.dataProvider = constituentLang;
        macroLang.CLDR.code = undefined; // it will return false for the filter
        macroLang.CLDR.scope = LanguageScope.Macrolanguage;
        macroLang.CLDR.notes = notes;
        macroLang.CLDR.name = macroLang.nameCanonical + ' (macrolanguage)';
        // Note: Don't add references to child languages here -- the parent reference below is sufficient
      }

      // Now set the replacement (cmn) as the canonical language for its macrolanguage (zh)
      if (constituentLang != null) {
        constituentLang.CLDR.code = macroLangCode;
        constituentLang.CLDR.notes = notes;
        constituentLang.CLDR.parentLanguageCode = macroLang?.ID;
      } else {
        // Looks like `him` and `srx` are missing -- perhaps they are discontinued codes
        if (DEBUG) console.debug(alias);
      }
    });

  // Go through all of the "bibliographic" aliases. Like the overlong aliases, these language codes
  // are rarely used but if you reference one -> a supported CLDR language can be used instead.
  languageAliases
    .filter(({ reason }) => reason === 'bibliographic')
    .forEach((alias) => {
      const lang = languages[alias.original];
      const replacement = languages[alias.replacement];
      if (lang != null && lang.ID != replacement.ID) {
        lang.CLDR = {
          code: undefined, // filtered out of regular results (only available in direct lookups)
          dataProvider: replacement,
          notes: (
            <>
              This language code <code>{alias.original}</code> is an ISO 639-2
              &quot;bibliographic&quot; language code -- as opposed to a &quot;terminology&quot;
              code. In modern use these language codes are never used. In CLDR,{' '}
              <code>{alias.replacement}</code> should be used instead.
            </>
          ),
        };
        if (DEBUG && replacement == null) {
          console.warn(
            `CLDR language ${alias.original} has no replacement data for ${alias.replacement}. This may cause issues.`,
          );
        }
      }
    });

  addCLDRLanguageMatching(languages);
}

function addCLDRLanguageMatching(languages: LanguageDictionary): void {
  // TODO: match by original codes or aliases?
  const languageMatchEntries = languageMatching.supplemental.languageMatching['written-new']
    .languageMatch as CLDRLanguageMatchImport[];

  languageMatchEntries.forEach((match) => {
    const desiredLanguageCode = getPureLanguageCode(match._desired);
    const supportedLanguageCode = getPureLanguageCode(match._supported);
    if (desiredLanguageCode == null || supportedLanguageCode == null) return;
    if (desiredLanguageCode === supportedLanguageCode) return;

    let desiredLanguage = languages[desiredLanguageCode];
    if (desiredLanguage?.CLDR.dataProvider?.type === EntityType.Language)
      desiredLanguage = desiredLanguage.CLDR.dataProvider;
    let supportedLanguage = languages[supportedLanguageCode];
    if (supportedLanguage?.CLDR.dataProvider?.type === EntityType.Language)
      supportedLanguage = supportedLanguage.CLDR.dataProvider;
    if (desiredLanguage == null || supportedLanguage == null) return;

    desiredLanguage.CLDR.languageMatch ??= [];
    desiredLanguage.CLDR.languageMatch.push({
      desired: match._desired,
      supported: match._supported,
      distance: Number(match._distance),
      oneway: match._oneway,
    });
  });
}

function getPureLanguageCode(languageTag: string): string | undefined {
  // Keep only language-to-language matches in this PR.
  // Locale/script/region-variable matches are intentionally deferred.
  if (!/^[a-z]{2,3}$/i.test(languageTag)) return undefined;
  return languageTag;
}

export async function loadCLDRCoverage(
  getCLDRLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  return await fetch('data/unicode/cldrCoverage.tsv')
    .then((res) => res.text())
    .then((text) => {
      const SKIP_THREE_HEADER_ROWS = 3;
      const cldrCoverage = text
        .split('\n')
        .slice(SKIP_THREE_HEADER_ROWS)
        .map(parseCLDRCoverageLine);
      cldrCoverage.forEach((cldrCov) => {
        const lang = getCLDRLanguage(cldrCov.languageCode);
        if (lang?.type !== EntityType.Language) {
          console.debug('During CLDR import', cldrCov.languageCode, 'missing from languages');
          return;
        }
        if (cldrCov.explicitScriptCode != null) {
          // If there is an explicit script code then drop the data for now
          // TODO add information to locales
          return;
        }
        lang.nameEndonym ??= cldrCov.nameEndonym;
        lang.CLDR.name = cldrCov.nameDisplay;
        lang.CLDR.coverage = {
          countOfCLDRLocales: cldrCov.countOfCLDRLocales,
          targetCoverageLevel: cldrCov.targetCoverageLevel,
          actualCoverageLevel: cldrCov.actualCoverageLevel,
          inICU: cldrCov.inICU,
        };
        setLanguageNames(lang);
      });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

function parseCLDRCoverageLine(line: string): CLDRCoverageImport {
  const parts = line.split('\t');
  const [languageCode, scriptCode] = parts[0].split('_');

  return {
    // Most of this data is not used yet
    languageCode: languageCode,
    explicitScriptCode: scriptCode,
    nameDisplay: parts[1],
    nameEndonym: parts[2],
    scriptDefaultCode: parts[3],
    territoryDefaultCode: parts[4],
    countOfCLDRLocales: Number.parseInt(parts[5]),
    targetCoverageLevel: parseCoverageLevel(parts[6]),
    actualCoverageLevel: parseCoverageLevel(parts[8]),
    inICU: parts[9] === 'ICU',
    percentOfValuesConfirmed: Number.parseFloat(parts[10]),
    percentOfModernValuesComplete: Number.parseFloat(parts[11]),
    percentOfModerateValuesComplete: Number.parseFloat(parts[12]),
    percentOfBasicValuesComplete: Number.parseFloat(parts[13]),
    percentOfCoreValuesComplete: Number.parseFloat(parts[14]),
    missingFeatures: parts[15]?.split(', '),
  };
}

type TerritoryLanguagePopulationStrings = {
  _gdp: string;
  _literacyPercent: string;
  _population: string;
  languagePopulation?: {
    [localeCode: string]: {
      _populationPercent: string;
      _officialStatus: string;
    };
  };
};

export function getLanguageCountsFromCLDR(dataContext: DataGetters): CensusData[] {
  const territoryInfoData = territoryInfo.supplemental.territoryInfo;
  return Object.entries(territoryInfoData)
    .map(([territoryCode, territoryData]) => {
      const typedData = territoryData as TerritoryLanguagePopulationStrings;
      const territoryPopulation = Math.round(parseInt(typedData._population));

      // Get the populations for each language from the CLDR data
      const rawLangPopulations = typedData.languagePopulation || {};
      const langPopulations = Object.entries(rawLangPopulations).reduce<Record<string, number>>(
        (accumulator, langEntry) => {
          const [inputLocaleCode, { _populationPercent }] = langEntry;
          const pop = Math.round((parseFloat(_populationPercent) * territoryPopulation) / 100);
          return convertCLDRLangPopToLangNavEntries(
            accumulator,
            inputLocaleCode,
            pop,
            dataContext.getLanguage,
          );
        },
        {},
      );
      const territory = dataContext.getTerritory(territoryCode);

      const census: CensusData = {
        type: EntityType.Census,
        ID: 'cldr.' + territoryCode,
        codeDisplay: 'cldr.' + territoryCode,
        nameDisplay: 'CLDR ' + (territory?.nameDisplay ?? territoryCode),
        names: ['CLDR ' + (territory?.nameDisplay ?? territoryCode)],

        population: territoryPopulation,
        isoRegionCode: territoryCode,
        yearCollected: 2025, // This is the year it was collected from CLDR not the actual year of the input data
        collectorType: CensusCollectorType.Secondary,
        presentedBy: 'CLDR',
        url: 'https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/territoryInfo.json',
        notes:
          'This data is imported from the latest release of the CLDR data. The year listed is the year the data is published, not the year the data was collected. CLDR is in the process of improving citations and data quality so take these numbers with a grain of salt.',

        languageCount: Object.values(langPopulations).length,
        languageEstimates: langPopulations,
      };

      return census;
    })
    .filter((census) => census.languageCount > 0);
}

function convertCLDRLangPopToLangNavEntries(
  accumulator: Record<string, number>,
  inputLocaleCode: string,
  population: number,
  getLanguage: (code: string) => LanguageData | undefined,
): Record<string, number> {
  if (population <= 0) return accumulator;

  // We have to do some messy language code parsing since entries here may be using 2-letter codes (eg. sr not srp) and
  // they may have script or other locale tags (eg. sr_Latn, ca_valencia, etc.), and they may be part of a macrolanguage
  // So we have to get the language code part and convert it to ISO 639-3 then add it back to the locale string.
  const cldrLanguageCode = inputLocaleCode.split('_')[0]; // Get the language code part, e.g. `sr_Latn` -> `sr`
  const extraCodeParts = inputLocaleCode.split('_').slice(1).join('_'); // Get the rest of the locale code, e.g. `sr_Latn` -> `Latn`

  const language = getLanguage(cldrLanguageCode);
  let languageCode = language?.ID ?? cldrLanguageCode;
  if (language?.CLDR?.parentLanguageCode != null) {
    // If the language a child of a macrolanguage, we don't know from the data if the number
    // describes the constituent language or the macrolanguage population. Since it's unknown
    // we will use the macrolanguage.
    const parentLang = language.CLDR.parentLanguage;
    if (parentLang?.CLDR.scope === LanguageScope.Macrolanguage) {
      languageCode = parentLang.ID;
    }
  }

  // Add the language to the population list
  // In case two entries refer to the same language (eg. hin and hin_Latn) we take the higher value
  if (accumulator[languageCode] == null || accumulator[languageCode] < population) {
    accumulator[languageCode] = population;
  }

  // When there are extra parts (eg. srp_Latn) we should add that record too
  // Currently the tool cannot handle these cases, but we're leaving it here for future work.
  if (extraCodeParts != '') {
    accumulator[languageCode + '_' + extraCodeParts] = population;
  }
  return accumulator;
}
