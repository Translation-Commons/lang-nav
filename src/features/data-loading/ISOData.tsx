import {
  getEmptyLanguageSourceSpecificData,
  getBaseLanguageData,
  ISO6391LanguageCode,
  ISO6393LanguageCode,
  ISO6395LanguageCode,
  LanguageCode,
  LanguageData,
  LanguageDictionary,
  LanguagesBySource,
  LanguageScope,
} from '@entities/language/LanguageTypes';
import { setLanguageNames } from '@entities/language/setLanguageNames';
import { parseVitalityISO } from '@entities/language/vitality/VitalityParsing';
import { VitalityISO } from '@entities/language/vitality/VitalityTypes';

type ISOLanguage6393Data = {
  codeISO6393: ISO6393LanguageCode; // ISO 639-3
  //   codeBibliographic: LanguageCode; // ISO 639-2b
  //   codeTerminological: LanguageCode; // ISO 639-2t
  codeISO6391: ISO6391LanguageCode | undefined;
  scope: LanguageScope | undefined;
  vitality: VitalityISO | undefined;
  name: string;
};

const DEBUG = false;

function getScopeFromLetterCode(code: string): LanguageScope | undefined {
  switch (code) {
    case 'I': // Individual language
      return LanguageScope.Language;
    case 'M':
      return LanguageScope.Macrolanguage;
    case 'S':
      return LanguageScope.SpecialCode;
    default:
      return undefined;
  }
}

function parseISOLanguage6393Line(line: string): ISOLanguage6393Data {
  const parts = line.split('\t');
  return {
    codeISO6393: parts[0],
    // codeBibliographic: parts[1], // Not used
    // codeTerminological: parts[2], // Not used
    codeISO6391: parts[3] != '' ? parts[3] : undefined,
    scope: getScopeFromLetterCode(parts[4]),
    vitality: parseVitalityISO(parts[5]),
    name: parts[6],
  };
}

export async function loadISOLanguages(): Promise<ISOLanguage6393Data[] | void> {
  return await fetch('data/iso/iso-639-3.tab')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1).map(parseISOLanguage6393Line))
    .catch((err) => console.error('Error loading TSV:', err));
}

type ISOMacrolanguageData = {
  codeMacro: ISO6393LanguageCode;
  codeConstituent: ISO6393LanguageCode;
};

export async function loadISOMacrolanguages(): Promise<ISOMacrolanguageData[] | void> {
  return await fetch('data/iso/macrolanguages.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1))
    .then((lines) => {
      return lines.map((line) => {
        const parts = line.split('\t');
        return { codeMacro: parts[0], codeConstituent: parts[1] };
      });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

type ISOLanguageFamilyData = {
  code: ISO6395LanguageCode;
  name: string;
  parent?: ISO6395LanguageCode;
};

export async function loadISOLanguageFamilies(): Promise<ISOLanguageFamilyData[] | void> {
  return await fetch('data/iso/families639-5.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(3)) // First 3 lines are headers and comments
    .then((lines) =>
      lines.map((line) => {
        const parts = line.split('\t');
        return { code: parts[0], name: parts[1], parent: parts[2] != '' ? parts[2] : undefined };
      }),
    )
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadISOFamiliesToLanguages(): Promise<Record<
  ISO6395LanguageCode,
  LanguageCode[]
> | void> {
  return await fetch('data/iso/familiesToLanguages.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(4)) // First 4 lines are headers and comments
    .then((lines) => lines.map((line) => line.split('\t')))
    .then((entries) => entries.map(([family, languages]) => [family, languages.split(' ')]))
    .then((entries) => Object.fromEntries(entries))
    .catch((err) => console.error('Error loading TSV:', err));
}

export function addISODataToLanguages(
  languages: LanguageDictionary,
  isoLanguages: ISOLanguage6393Data[],
): void {
  isoLanguages.forEach((isoLang) => {
    const lang = languages[isoLang.codeISO6393];
    if (lang == null) {
      if (DEBUG) console.log(`${isoLang.codeISO6393} not found`);
      return;
    }

    // Fill out ISO information on the language data
    lang.codeISO6391 = isoLang.codeISO6391;
    lang.vitalityISO = isoLang.vitality;
    lang.scope = isoLang.scope;
    lang.sourceSpecific.ISO.scope = isoLang.scope;
    lang.sourceSpecific.ISO.name = isoLang.name;
    lang.sourceSpecific.BCP.scope = isoLang.scope;
    lang.sourceSpecific.BCP.name = isoLang.name;
    lang.sourceSpecific.BCP.code = isoLang.codeISO6391 ?? isoLang.codeISO6393;
    lang.sourceSpecific.CLDR.code = isoLang.codeISO6391 ?? isoLang.codeISO6393;
    setLanguageNames(lang);
  });
}

/**
 * This performs a series of steps to associate languages with macrolanguages.
 *
 * At the moment, this is redundant because the "parentLanguage" field from the main language.tsv is complete.
 * However, in the future we may drop that column from the main language table, and we should get that data from this process.
 */
export function addISOMacrolanguageData(
  languages: LanguageDictionary,
  macrolanguages: ISOMacrolanguageData[],
): void {
  macrolanguages.forEach((relation) => {
    const macro = languages[relation.codeMacro];
    const constituent = languages[relation.codeConstituent];
    if (parent == null) {
      if (DEBUG) console.log(`Macrolanguage ${relation.codeMacro} not found`);
      return;
    }
    if (constituent == null) {
      if (DEBUG) console.log(`Constituent language ${relation.codeConstituent} not found`);
      return;
    }
    const parentLanguageCode = constituent.sourceSpecific.ISO.parentLanguageCode;
    if (parentLanguageCode != macro.ID) {
      if (DEBUG)
        // As of 2025-04-30 all exceptions to this are temporary
        console.log(
          `parent different for ${constituent.ID}. Is ${parentLanguageCode} but should be ${macro.ID}`,
        );
    }
    if (macro.scope !== LanguageScope.Macrolanguage) {
      if (DEBUG)
        // As of 2025-04-30 all macrolanguage are correctly labeled above
        console.log(
          `Macrolanguage ${macro.ID} should be considered a macrolanguage, instead it is a ${macro.scope}`,
        );
    }
  });
}

export function addISOLanguageFamilyData(
  languagesBySource: LanguagesBySource,
  families: ISOLanguageFamilyData[],
  isoLangsToFamilies: Record<ISO6395LanguageCode, LanguageCode[]>,
): void {
  // Add new language entries for language families, otherwise fill in missing data
  families.forEach((family) => {
    const familyEntry = languagesBySource.ISO[family.code];
    // trim excess from the name
    const name = family.name.replace(/ languages| \(family\)/gi, '');

    // If the entry is missing, create a new one
    if (familyEntry == null) {
      const sourceSpecific = {
        ...getEmptyLanguageSourceSpecificData(),
        All: { code: family.code, parentLanguageCode: family.parent, childLanguages: [] },
        ISO: { code: family.code, name, parentLanguageCode: family.parent, childLanguages: [] },
        BCP: { code: family.code, name, parentLanguageCode: family.parent, childLanguages: [] },
      };

      const familyEntry: LanguageData = {
        ...getBaseLanguageData(family.code, name),
        names: [name, family.name],
        scope: LanguageScope.Family,
        viabilityConfidence: 'No',
        viabilityExplanation: 'Language family',
        sourceSpecific,
      };
      languagesBySource.All[family.code] = familyEntry;
      languagesBySource.ISO[family.code] = familyEntry;
      languagesBySource.BCP[family.code] = familyEntry;
    } else {
      // familyEntry exists, but it may be missing data
      if (!familyEntry.nameDisplay || familyEntry.nameDisplay === '0') {
        familyEntry.nameDisplay = family.name;
      }
      familyEntry.sourceSpecific.All.parentLanguageCode = family.parent;
      familyEntry.sourceSpecific.ISO.parentLanguageCode = family.parent;
      familyEntry.sourceSpecific.ISO.scope = LanguageScope.Family;
      familyEntry.sourceSpecific.ISO.name = name;
      familyEntry.sourceSpecific.BCP.parentLanguageCode = family.parent;
      familyEntry.sourceSpecific.BCP.scope = LanguageScope.Family;
      familyEntry.sourceSpecific.BCP.name = name;
      familyEntry.scope = LanguageScope.Family;
    }
  });

  // Now that we have language families
  // Iterate again to point constituent languages to the language family
  Object.entries(isoLangsToFamilies).forEach(([familyCode, constituentLanguages]) => {
    constituentLanguages.forEach((langCode) => {
      // Get the language using BCP-47 codes (preferring 2-letter ISO 639-1, otherwise 3-letter ISO 639-3)
      const lang = languagesBySource.BCP[langCode] ?? languagesBySource.ISO[langCode];
      if (lang == null) {
        console.log(`${langCode} should be part of ${familyCode} but ${langCode} does not exist`);
        return;
      }
      // languages may already have macrolanguage parents but if its unset, set the parent
      lang.sourceSpecific.All.parentLanguageCode ??= familyCode;
      lang.sourceSpecific.ISO.parentLanguageCode ??= familyCode;
      lang.sourceSpecific.BCP.parentLanguageCode ??= familyCode;
    });
  });
}
