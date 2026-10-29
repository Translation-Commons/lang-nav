import { setLanguageNames } from '@entities/language/identity/setLanguageNames';
import {
  getBaseLanguageData,
  ISO6391LanguageCode,
  ISO6393LanguageCode,
  ISO6395LanguageCode,
  LanguageCode,
  LanguageData,
  LanguageDictionary,
  LanguageScope,
} from '@entities/language/LanguageTypes';
import { parseLanguageISOStatus } from '@entities/language/vitality/VitalityParsing';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

type ISOLanguage6393Data = {
  codeISO6393: ISO6393LanguageCode; // ISO 639-3
  codeISO6392b: LanguageCode; // ISO 639-2b
  //   codeTerminological: LanguageCode; // ISO 639-2t
  codeISO6391: ISO6391LanguageCode | undefined;
  scope: LanguageScope | undefined;
  vitality: LanguageISOStatus | undefined;
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
    codeISO6392b: parts[1], // ISO 639-2b
    // codeTerminological: parts[2], // Not used, its the canonical language code
    codeISO6391: parts[3] != '' ? parts[3] : undefined,
    scope: getScopeFromLetterCode(parts[4]),
    vitality: parseLanguageISOStatus(parts[5]),
    name: parts[6],
  };
}

export async function loadISOLanguages(): Promise<ISOLanguage6393Data[] | void> {
  return await fetch('data/iso/iso-639-3.tab')
    .then((res) => res.text())
    .then(splitAndRemoveHeaders)
    .then((lines) => lines.map(parseISOLanguage6393Line))
    .catch((err) => console.error('Error loading TSV:', err));
}

type ISOMacrolanguageData = {
  codeMacro: ISO6393LanguageCode;
  codeConstituent: ISO6393LanguageCode;
};

function splitAndRemoveHeaders(text: string): string[] {
  return text
    .split('\n')
    .filter((l) => l.trim() !== '' && !l.startsWith('#'))
    .slice(1);
}

export async function loadISOMacrolanguages(): Promise<ISOMacrolanguageData[] | void> {
  return await fetch('data/iso/macrolanguages.tsv')
    .then((res) => res.text())
    .then(splitAndRemoveHeaders)
    .then((lines) =>
      lines.map((line) => {
        const parts = line.split('\t');
        return { codeMacro: parts[0], codeConstituent: parts[1] };
      }),
    )
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
    .then(splitAndRemoveHeaders)
    .then((lines) =>
      lines.map((line) => {
        const parts = line.split('\t');
        return {
          code: parts[0],
          name: parts[1],
          parent: parts[2] != '' ? parts[2] : undefined,
          scope: LanguageScope.Family,
        };
      }),
    )
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadISOFamiliesToLanguages(): Promise<Record<
  ISO6395LanguageCode,
  LanguageCode[]
> | void> {
  return await fetch('data/tc/familiesToLanguages.tsv')
    .then((res) => res.text())
    .then(splitAndRemoveHeaders)
    .then((lines) => lines.map((line) => line.split('\t')))
    .then((entries) => entries.map(([family, languages]) => [family, languages.split(' ')]))
    .then((entries) => Object.fromEntries(entries))
    .catch((err) => console.error('Error loading TSV:', err));
}

export function addISODataToLanguages(
  languages: LanguageDictionary,
  isoLanguages: ISOLanguage6393Data[],
): void {
  // Add ISO data
  isoLanguages.forEach((isoLang) => {
    const lang = languages[isoLang.codeISO6393];
    if (lang == null) {
      if (DEBUG) console.debug(`${isoLang.codeISO6393} not found`);
      return;
    }

    // Fill out ISO information on the language data
    lang.ISO.code = isoLang.codeISO6393;
    lang.ISO.code6391 = isoLang.codeISO6391;
    lang.ISO.code6392b = isoLang.codeISO6392b;
    lang.ISO.status = isoLang.vitality;
    lang.scope = isoLang.scope;
    lang.ISO.scope = isoLang.scope;
    lang.ISO.name = isoLang.name;

    // BCP, CLDR and UNESCO inherit from ISO
    lang.BCP.scope = isoLang.scope;
    lang.BCP.name = isoLang.name;
    lang.BCP.code = isoLang.codeISO6391 ?? isoLang.codeISO6393;
    lang.CLDR.code = isoLang.codeISO6391 ?? isoLang.codeISO6393;
    lang.UNESCO.code = isoLang.codeISO6393;

    // Combined prefers the ISO scope
    if (isoLang.scope === LanguageScope.Language) lang.Combined.scope = isoLang.scope;
    if (isoLang.scope === LanguageScope.Macrolanguage) lang.Combined.scope = isoLang.scope;

    // Also add alternative names
    setLanguageNames(lang);

    // Add code references
    if (lang.ISO.code) languages[lang.ISO.code] = lang;
    if (lang.ISO.code6391) languages[lang.ISO.code6391] = lang;
    if (lang.ISO.code6392b) languages[lang.ISO.code6392b] = lang;
  });

  // Scan through language entries that are scoped as individual languages that have 3-letter codes but are not actually in ISO
  Object.values(languages).forEach((lang) => {
    if (lang.scope === LanguageScope.Language && lang.ID.match(/^[a-z]{3}$/) && !lang.ISO.code) {
      if (DEBUG)
        console.debug(
          `Individual language ${lang.ID} has a 3-letter ISO code but is not actually in ISO`,
        );
    }
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
    if (macro == null) {
      if (DEBUG) console.debug(`Macrolanguage ${relation.codeMacro} not found`);
      return;
    }
    if (constituent == null) {
      if (DEBUG) console.debug(`Constituent language ${relation.codeConstituent} not found`);
      return;
    }
    const parentLanguageCode = constituent.ISO.parentLanguageCode;
    if (parentLanguageCode != macro.ID) {
      if (DEBUG)
        // As of 2025-04-30 all exceptions to this are temporary
        console.debug(
          `parent different for ${constituent.ID}. Is ${parentLanguageCode} but should be ${macro.ID}`,
        );
    }
    if (macro.scope !== LanguageScope.Macrolanguage) {
      if (DEBUG)
        // As of 2025-04-30 all macrolanguage are correctly labeled above
        console.debug(
          `Macrolanguage ${macro.ID} should be considered a macrolanguage, instead it is a ${macro.scope}`,
        );
    }
  });
}

export function addISOLanguageFamilyData(
  languages: LanguageDictionary,
  families: ISOLanguageFamilyData[],
  isoLangsToFamilies: Record<ISO6395LanguageCode, LanguageCode[]>,
): void {
  // Add new language entries for language families, otherwise fill in missing data
  families.forEach((family) => {
    const familyEntry = languages[family.code];
    // trim excess from the name
    const name = family.name.replace(/ languages| \(family\)/gi, '');

    // If the entry is missing, create a new one
    if (familyEntry == null) {
      const sourceSpecific = {
        Combined: {
          code: family.code,
          parentLanguageCode: family.parent,
          scope: family.parent ? LanguageScope.Subfamily : LanguageScope.Family,
          childLanguages: [],
        },
        ISO: {
          code: family.code,
          name,
          parentLanguageCode: family.parent,
          scope: LanguageScope.Family,
          childLanguages: [],
        },
        BCP: {
          code: family.code,
          name,
          parentLanguageCode: family.parent,
          scope: LanguageScope.Family,
          childLanguages: [],
        },
      };

      const familyEntry: LanguageData = {
        ...getBaseLanguageData(family.code, name),
        names: [name, family.name],
        scope: LanguageScope.Family,
        viabilityConfidence: 'No',
        viabilityExplanation: 'Language family',
        ...sourceSpecific,
      };
      languages[family.code] = familyEntry;
    } else {
      // familyEntry exists, but it may be missing data
      if (!familyEntry.nameDisplay || familyEntry.nameDisplay === '0') {
        familyEntry.nameDisplay = family.name;
      }
      familyEntry.Combined.parentLanguageCode ??= family.parent;
      familyEntry.Combined.scope ??= family.parent ? LanguageScope.Subfamily : LanguageScope.Family;
      familyEntry.ISO.code ??= family.code;
      familyEntry.ISO.parentLanguageCode = family.parent;
      familyEntry.ISO.scope = LanguageScope.Family;
      familyEntry.ISO.name = name;
      familyEntry.BCP.code ??= family.code;
      familyEntry.BCP.parentLanguageCode = family.parent;
      familyEntry.BCP.scope = LanguageScope.Family;
      familyEntry.BCP.name = name;
      familyEntry.scope ??= family.parent ? LanguageScope.Subfamily : LanguageScope.Family;
    }
  });

  // Now that we have language families
  // Iterate again to point constituent languages to the language family
  Object.entries(isoLangsToFamilies).forEach(([familyCode, constituentLanguages]) => {
    constituentLanguages.forEach((langCode) => {
      // Get the language using BCP-47 codes (preferring 2-letter ISO 639-1, otherwise 3-letter ISO 639-3)
      const lang = languages[langCode];
      if (lang == null) {
        console.debug(`${langCode} should be part of ${familyCode} but ${langCode} does not exist`);
        return;
      }
      // languages may already have macrolanguage parents but if its unset, set the parent
      lang.Combined.parentLanguageCode ??= familyCode;
      lang.ISO.parentLanguageCode ??= familyCode;
      lang.BCP.parentLanguageCode ??= familyCode;
    });
  });
}
