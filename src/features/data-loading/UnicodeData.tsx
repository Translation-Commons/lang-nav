import aliases from 'cldr-core/supplemental/aliases.json';
import territoryInfo from 'cldr-core/supplemental/territoryInfo.json';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { CensusCollectorType, CensusData } from '@entities/census/CensusTypes';
import {
  LanguageData,
  LanguageDictionary,
  LanguagesBySource,
  LanguageScope,
} from '@entities/language/LanguageTypes';
import { CLDRCoverageLevel, CLDRCoverageImport } from '@entities/types/CLDRTypes';
import { LocaleData, TerritoryData } from '@entities/types/DataTypes';

const DEBUG = false;

export function addCLDRLanguageDetails(languagesBySource: LanguagesBySource): void {
  // Start with the initialized
  const cldrLanguages = languagesBySource.CLDR;

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
      const lang = cldrLanguages[alias.original];
      let replacementData: LanguageData | LocaleData = cldrLanguages[alias.replacement];
      if (replacementData == null) {
        // If the replacement data is not found, it may be a locale -- but we need to convert it to underscored ISO-639-3 form
        // For example, `sw-CD` replaces `swc`, but we need to convert it to `swc_CD` to match out source
        const replacementIdParts = alias.replacement.split('-');
        // TODO need to add the equivalent locales swa_CD, fas_AF, srp_Latn
        // const replacementLangID = cldrLanguages[replacementIdParts[0]]?.ID ?? replacementIdParts[0];
        // replacementData = locales[replacementLangID + '_' + replacementIdParts.slice(1).join('_')];
        replacementData = cldrLanguages[replacementIdParts[0]];
      }
      if (lang != null) {
        // Add a note that the language code is considered "overlong" and a different language code or locale code should be used instead for CLDR purposes
        lang.sourceSpecific.CLDR.code = undefined;
        lang.sourceSpecific.CLDR.notes = (
          <>
            This language code <code>{alias.original}</code> is considered &quot;overlong&quot; in
            CLDR, use <code>{alias.replacement}</code> instead.
          </>
        );
        // Add the replacement code as a child language
        lang.cldrDataProvider = replacementData;
        if (DEBUG && replacementData == null) {
          console.warn(
            `CLDR language ${alias.original} has no replacement data for ${alias.replacement}. This may cause issues.`,
          );
        }
      }
      if (DEBUG && lang != null) {
        console.log('CLDR import', alias, lang);
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
      const macroLangAltCode = macroLangCode + '**';
      const constituentLang = cldrLanguages[alias.original]; // eg. Mandarin Chinese `cmn` in ISO but effective `zh` in CLDR
      const macroLang = cldrLanguages[alias.replacement]; // eg. Chinese (macrolanguage) `zho`/`zh` in ISO
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
        macroLang.cldrDataProvider = constituentLang;
        macroLang.sourceSpecific.CLDR.code = macroLangAltCode; // Distinguish the macrolanguage from the constituent language
        macroLang.sourceSpecific.CLDR.scope = LanguageScope.Macrolanguage;
        macroLang.sourceSpecific.CLDR.childLanguages = [constituentLang];
        macroLang.sourceSpecific.CLDR.notes = notes;
        macroLang.sourceSpecific.CLDR.name = macroLang?.nameCanonical + ' (macrolanguage)';
        // Remove the regular symbolic reference in the CLDR list to the macrolanguage object (since it will be replaced below)
        delete cldrLanguages[macroLangCode];
        cldrLanguages[macroLangAltCode] = macroLang; // But put it back in with ** to distinguish it
      }

      // Now set the replacement (cmn) as the canonical language for its macrolanguage (zh)
      if (constituentLang != null) {
        cldrLanguages[macroLangCode] = constituentLang;
        constituentLang.sourceSpecific.CLDR.code = macroLangCode;
        constituentLang.sourceSpecific.CLDR.notes = notes;
        constituentLang.sourceSpecific.CLDR.parentLanguageCode = macroLangAltCode;

        // Remove the old link (eg. from cmn) since it's now canonical for the macrolanguage code (zh)
        delete cldrLanguages[constituentLangCode];
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
      const lang = cldrLanguages[alias.original];
      const replacementData: LanguageData = cldrLanguages[alias.replacement];
      if (lang != null) {
        lang.sourceSpecific.CLDR = {
          code: alias.original,
          childLanguages: [],
          notes: (
            <>
              This language code <code>{alias.original}</code> is an ISO 639-2
              &quot;bibliographic&quot; language code -- as opposed to a &quot;terminology&quot;
              code. In modern use these language codes are never used. In CLDR,{' '}
              <code>{alias.replacement}</code> should be used instead.
            </>
          ),
        };
        // Add the replacement code as a child language and delete the link to the unsupported one
        lang.cldrDataProvider = replacementData;
        delete cldrLanguages[alias.original];
        if (DEBUG && replacementData == null) {
          console.warn(
            `CLDR language ${alias.original} has no replacement data for ${alias.replacement}. This may cause issues.`,
          );
        }
      }
    });

  languagesBySource.CLDR = cldrLanguages;
}

export async function loadCLDRCoverage(
  getLanguage: (id: string) => LanguageData | undefined,
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
        const lang = getLanguage(cldrCov.languageCode);
        if (lang?.type !== ObjectType.Language) {
          console.log('During CLDR import ', cldrCov.languageCode, 'missing from languages');
          return;
        }
        if (cldrCov.explicitScriptCode != null) {
          // If there is an explicit script code then drop the data for now
          // TODO add information to locales
          return;
        }
        lang.nameEndonym ??= cldrCov.nameEndonym;
        lang.sourceSpecific.CLDR.name = cldrCov.nameDisplay;
        lang.cldrCoverage = {
          countOfCLDRLocales: cldrCov.countOfCLDRLocales,
          targetCoverageLevel: cldrCov.targetCoverageLevel,
          actualCoverageLevel: cldrCov.actualCoverageLevel,
          inICU: cldrCov.inICU,
        };
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
    targetCoverageLevel: parts[6] !== '' ? (parts[6] as CLDRCoverageLevel) : CLDRCoverageLevel.Core,
    actualCoverageLevel: parts[8] !== '' ? (parts[8] as CLDRCoverageLevel) : CLDRCoverageLevel.Core,
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

export function getLanguageCountsFromCLDR(
  languages: LanguageDictionary,
  territories: Record<string, TerritoryData>,
): CensusData[] {
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
          return convertCLDRLangPopToLangNavEntries(accumulator, inputLocaleCode, pop, languages);
        },
        {},
      );
      const territory = territories[territoryCode];

      const census: CensusData = {
        type: ObjectType.Census,
        ID: 'cldr.' + territoryCode,
        codeDisplay: 'cldr.' + territoryCode,
        nameDisplay: 'CLDR ' + (territory?.nameDisplay ?? territoryCode),
        names: ['CLDR ' + (territory?.nameDisplay ?? territoryCode)],

        eligiblePopulation: territoryPopulation,
        isoRegionCode: territoryCode,
        yearCollected: new Date().getFullYear(), // This is the year it was collected from CLDR not the actual year of the input data
        collectorType: CensusCollectorType.CLDR,
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
  languages: LanguageDictionary,
): Record<string, number> {
  // We have to do some messy language code parsing since entries here may be using 2-letter codes (eg. sr not srp) and
  // they may have script or other locale tags (eg. sr_Latn, ca_valencia, etc.), and they may be part of a macrolanguage
  // So we have to get the language code part and convert it to ISO 639-3 then add it back to the locale string.
  const cldrLanguageCode = inputLocaleCode.split('_')[0]; // Get the language code part, e.g. `sr_Latn` -> `sr`
  const extraCodeParts = inputLocaleCode.split('_').slice(1).join('_'); // Get the rest of the locale code, e.g. `sr_Latn` -> `Latn`

  const language = languages[cldrLanguageCode];
  let languageCode = language?.ID ?? cldrLanguageCode;
  if (language?.sourceSpecific?.CLDR?.parentLanguageCode != null) {
    // If the language a child of a macrolanguage, we don't know from the data if the number
    // describes the constituent language or the macrolanguage population. Since it's unknown
    // we will use the macrolanguage.
    const parentLang = language.sourceSpecific.CLDR.parentLanguage;
    if (
      parentLang != null &&
      parentLang.sourceSpecific.CLDR.scope === LanguageScope.Macrolanguage
    ) {
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
