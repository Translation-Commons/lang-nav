import {
  ISO6391LanguageCode,
  ISO6393LanguageCode,
  ISO6395LanguageCode,
  LanguageCode,
  LanguageData,
  LanguageDictionary,
  LanguagesBySchema,
  LanguageScope,
} from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

export enum ISOLanguageVitality {
  Living = 'Living',
  Extinct = 'Extinct',
  SpecialCode = 'Special Code',
  Constructed = 'Constructed',
  Historic = 'Historic',
}

type ISOLanguage6393Data = {
  codeISO6393: ISO6393LanguageCode; // ISO 639-3
  //   codeBibliographic: LanguageCode; // ISO 639-2b
  //   codeTerminological: LanguageCode; // ISO 639-2t
  codeISO6391: ISO6391LanguageCode | undefined;
  scope: LanguageScope | undefined;
  vitality: ISOLanguageVitality | undefined;
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

function getVitalityFromLetterCode(code: string): ISOLanguageVitality | undefined {
  switch (code) {
    case 'C':
      return ISOLanguageVitality.Constructed;
    case 'E':
      return ISOLanguageVitality.Extinct;
    case 'H':
      return ISOLanguageVitality.Historic;
    case 'L':
      return ISOLanguageVitality.Living;
    case 'S':
      return ISOLanguageVitality.SpecialCode;
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
    vitality: getVitalityFromLetterCode(parts[5]),
    name: parts[6],
  };
}

export async function loadISOLanguages(): Promise<ISOLanguage6393Data[] | void> {
  return await fetch('data/iso/languages639-3.tsv')
    .then((res) => res.text())
    .then((text) => {
      return text.split('\n').slice(1).map(parseISOLanguage6393Line);
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

type ISOMacrolanguageData = {
  codeMacro: ISO6393LanguageCode;
  codeConstituent: ISO6393LanguageCode;
};

export async function loadISOMacrolanguages(): Promise<ISOMacrolanguageData[] | void> {
  return await fetch('data/iso/macrolanguages.tsv')
    .then((res) => res.text())
    .then((text) => {
      return text
        .split('\n')
        .slice(1)
        .map((line) => {
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
    .then((text) => {
      return text
        .split('\n')
        .slice(3) // First 3 lines are headers and comments
        .map((line) => {
          const parts = line.split('\t');
          return { code: parts[0], name: parts[1], parent: parts[2] != '' ? parts[2] : undefined };
        });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadISOFamiliesToLanguages(): Promise<Record<
  ISO6395LanguageCode,
  LanguageCode[]
> | void> {
  return await fetch('data/iso/familiesToLanguages.tsv')
    .then((res) => res.text())
    .then((text) => {
      return text
        .split('\n')
        .slice(4) // First 4 lines are headers and comments
        .reduce<Record<ISO6395LanguageCode, LanguageCode[]>>((families, line) => {
          const parts = line.split('\t');
          families[parts[0]] = parts[1].split(' ');
          return families;
        }, {});
    })
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
    lang.schemaSpecific.ISO.scope = isoLang.scope;
    lang.schemaSpecific.ISO.name = isoLang.name;
    lang.schemaSpecific.CLDR.code = isoLang.codeISO6391 ?? isoLang.codeISO6393;
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
    const parentLanguageCode = constituent.schemaSpecific.ISO.parentLanguageCode;
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
  languagesBySchema: LanguagesBySchema,
  families: ISOLanguageFamilyData[],
  isoLangsToFamilies: Record<ISO6395LanguageCode, LanguageCode[]>,
): void {
  // Add new language entries for language families, otherwise fill in missing data
  families.forEach((family) => {
    const familyEntry = languagesBySchema.ISO[family.code];
    // trim excess from the name
    const name = family.name.replace(/ languages| \(family\)/gi, '');

    // If the entry is missing, create a new one
    if (familyEntry == null) {
      const schemaSpecific = {
        Inclusive: { code: family.code, parentLanguageCode: family.parent, childLanguages: [] },
        ISO: { code: family.code, name, parentLanguageCode: family.parent, childLanguages: [] },
        UNESCO: { childLanguages: [] }, // Not including lang families in UNESCO's WAL
        Glottolog: { childLanguages: [] }, // No glottolog data
        CLDR: { childLanguages: [] }, // CLDR does not include language families
      };

      const familyEntry: LanguageData = {
        type: ObjectType.Language,
        ID: family.code,
        codeDisplay: family.code,
        nameCanonical: name,
        nameDisplay: name,
        names: [name, family.name],
        scope: LanguageScope.Family,
        viabilityConfidence: 'No',
        viabilityExplanation: 'Language family',
        schemaSpecific,
        writingSystems: {},
        locales: [],
        childLanguages: [],
      };
      languagesBySchema.Inclusive[family.code] = familyEntry;
      languagesBySchema.ISO[family.code] = familyEntry;
    } else {
      // familyEntry exists, but it may be missing data
      if (!familyEntry.nameDisplay || familyEntry.nameDisplay === '0') {
        familyEntry.nameDisplay = family.name;
      }
      familyEntry.schemaSpecific.Inclusive.parentLanguageCode = family.parent;
      familyEntry.schemaSpecific.ISO.parentLanguageCode = family.parent;
      familyEntry.schemaSpecific.ISO.scope = LanguageScope.Family;
      familyEntry.schemaSpecific.ISO.name = name;
      familyEntry.scope = LanguageScope.Family;
    }
  });

  // Now that we have language families
  // Iterate again to point constituent languages to the language family
  Object.entries(isoLangsToFamilies).forEach(([familyCode, constituentLanguages]) => {
    constituentLanguages.forEach((langCode) => {
      // Get the language checking the 3-letter language code (or the 2-letter that is used in CLDR)
      const lang = languagesBySchema.ISO[langCode] ?? languagesBySchema.CLDR[langCode];
      if (lang == null) {
        console.log(`${langCode} should be part of ${familyCode} but ${langCode} does not exist`);
        return;
      }
      // languages may already have macrolanguage parents but if its unset, set the parent
      lang.schemaSpecific.Inclusive.parentLanguageCode ??= familyCode;
      lang.schemaSpecific.ISO.parentLanguageCode ??= familyCode;
    });
  });
}
