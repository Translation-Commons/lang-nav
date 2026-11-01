import type { LanguageData, LanguageDictionary } from '@entities/language/LanguageTypes';
import { EntityType, type EntityRef } from '@entities/types/EntityTypes';

type MacroStandardData = {
  macroRef: EntityRef;
  standardRef: EntityRef;
  reason: string;
};

export async function loadMacroStandards(): Promise<MacroStandardData[]> {
  return await fetch(`data/tc/macroStandard.tsv`)
    .then((res) => res.text())
    .then((text) => text.split('\n').filter((l) => !l.startsWith('#') && !!l))
    .then((lines) => lines.map(parseMacroStandards).filter((r) => r != null))
    .catch((err) => {
      console.error('Error loading TSV:', err);
      return [];
    });
}

// Macro Code	Macro Name	Standard Code	Standard Name	Supporting Data
// zho	Chinese languages	cmn	Mandarin Chinese	87.8
// ara	Arabic	arb	Modern Standard Arabic	common written version of Arabic
// msa	Malayic	zsm	Standard Malay	usual reference for Malay

function parseMacroStandards(line: string): MacroStandardData | undefined {
  const parts = line.split('\t');
  if (parts[0].includes('-')) return; // Not yet handling script/locale based standards
  return {
    macroRef: { type: EntityType.Language, ID: parts[0].trim(), name: parts[1].trim() },
    standardRef: { type: EntityType.Language, ID: parts[2].trim(), name: parts[3].trim() },
    reason: parts[4].trim(),
  };
}

export function addMacrolanguageStandards(
  languages: LanguageDictionary,
  macroStandards: MacroStandardData[],
): void {
  macroStandards.forEach(({ macroRef, standardRef, reason }) => {
    const macro = languages[macroRef.ID];
    if (!macro) return;
    macro.standardLanguage = standardRef;
    if (reason.match('[0-9]*(\\.[0-9]*)?')) {
      macro.standardReason = 'This is largest consituent, at ' + reason + '% of the macrolanguage';
    } else {
      macro.standardReason = reason;
    }
  });
}

// Follow the combined language family tree and connect languages to their standard
export function connectStandardLanguages(languages: LanguageDictionary): void {
  Object.values(languages)
    .filter((lang) => lang.Combined.parentLanguage == null)
    .forEach((lang) => connectStandardLanguage(lang));
}

function connectStandardLanguage(lang: LanguageData, standard?: EntityRef, depth = 0): void {
  if (depth > 30) return; // Prevent stack overflow

  if (standard && !lang.standardLanguage) lang.standardLanguage = standard;

  lang.Combined.childLanguages?.forEach((child) =>
    connectStandardLanguage(child, lang.standardLanguage, depth + 1),
  );
}
