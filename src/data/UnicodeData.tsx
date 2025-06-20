import aliases from 'cldr-core/supplemental/aliases.json';

import { CLDRCoverageLevel, CLDRCoverageImport } from '../types/CLDRTypes';
import { LocaleData } from '../types/DataTypes';
import { LanguageData, LanguagesBySchema, LanguageScope } from '../types/LanguageTypes';

import { CoreData } from './CoreData';

const DEBUG = true;

export function addCLDRLanguageDetails(languagesBySchema: LanguagesBySchema): void {
  // Start with the initialized
  const cldrLanguages = languagesBySchema.CLDR;

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
        // For example, `sw-CD` replaces `swc`, but we need to convert it to `swc_CD` to match out schema
        const replacementIdParts = alias.replacement.split('-');
        // TODO need to add the equivalent locales swa_CD, fas_AF, srp_Latn
        // const replacementLangID = cldrLanguages[replacementIdParts[0]]?.ID ?? replacementIdParts[0];
        // replacementData = locales[replacementLangID + '_' + replacementIdParts.slice(1).join('_')];
        replacementData = cldrLanguages[replacementIdParts[0]];
      }
      if (lang != null) {
        // Add a note that the language code is considered "overlong" and a different language code or locale code should be used instead for CLDR purposes
        lang.schemaSpecific.CLDR = {
          code: alias.original,
          childLanguages: [],
          notes: (
            <>
              This language code <code>{alias.original}</code> is considered &quot;overlong&quot; in
              CLDR, use <code>{alias.replacement}</code> instead.
            </>
          ),
        };
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
        macroLang.schemaSpecific.CLDR.scope = LanguageScope.Macrolanguage;
        macroLang.schemaSpecific.CLDR.notes = notes;
        // Remove the symbolic reference in the CLDR list to the macrolanguage object
        delete cldrLanguages[macroLangCode];
      }

      // Now set the replacement (cmn) as the canonical language for its macrolanguage (zh)
      if (constituentLang != null) {
        cldrLanguages[macroLangCode] = constituentLang;
        constituentLang.schemaSpecific.CLDR.code = macroLangCode;
        constituentLang.schemaSpecific.CLDR.notes = notes;

        // Remove the old link (eg. from cmn) since it's now canonical for the macrolanguage code (zh)
        delete cldrLanguages[constituentLangCode];
      } else {
        // Looks like `him` and `srx` are missing -- perhaps they are discontinued codes
        if (DEBUG) console.debug(alias);
      }
    });

  // Go through all of the "bibliographic" aliases. Like the overlong aliases they are not used but if you reference one a CLDR language will appear.

  // Go through all "overlong" aliases. We already handled most of them by using ISO 639-1 two-letter codes but a few
  // more exist, in particular eg. swc -> sw_CD and prs -> fa_AF
  languageAliases
    .filter(({ reason }) => reason === 'bibliographic')
    .forEach((alias) => {
      const lang = cldrLanguages[alias.original];
      const replacementData: LanguageData = cldrLanguages[alias.replacement];
      if (lang != null) {
        lang.schemaSpecific.CLDR = {
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
        // Add the replacement code as a child language
        lang.cldrDataProvider = replacementData;
        if (DEBUG && replacementData == null) {
          console.warn(
            `CLDR language ${alias.original} has no replacement data for ${alias.replacement}. This may cause issues.`,
          );
        }
      }
    });

  languagesBySchema.CLDR = cldrLanguages;
}

export async function loadCLDRCoverage(coreData: CoreData): Promise<void> {
  const cldrLanguages = coreData.languagesBySchema.CLDR;

  return await fetch('data/unicode/cldrCoverage.tsv')
    .then((res) => res.text())
    .then((text) => {
      const SKIP_THREE_HEADER_ROWS = 3;
      const cldrCoverage = text
        .split('\n')
        .slice(SKIP_THREE_HEADER_ROWS)
        .map(parseCLDRCoverageLine);
      cldrCoverage.forEach((cldrCov) => {
        const lang = cldrLanguages[cldrCov.languageCode];
        if (lang == null) {
          console.log('During CLDR import ', cldrCov.languageCode, 'missing from languages');
          return;
        }
        if (cldrCov.explicitScriptCode != null) {
          // If there is an explicit script code then drop the data for now
          // TODO add information to locales
          return;
        }
        lang.nameEndonym ??= cldrCov.nameEndonym;
        lang.schemaSpecific.CLDR.name = cldrCov.nameDisplay;
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
