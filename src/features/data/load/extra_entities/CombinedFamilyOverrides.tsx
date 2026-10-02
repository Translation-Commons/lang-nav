import { LanguageCode, LanguageDictionary } from '@entities/language/LanguageTypes';

export type CombinedFamilyOverride = {
  parentLanguageCode: LanguageCode;
  childLanguageCode: LanguageCode;
};

const HEADER_PARENT_COLUMN = 'parentLanguageCode';

export async function loadCombinedFamilyOverrides(): Promise<CombinedFamilyOverride[] | void> {
  return await fetch('data/tc/languageFamilyCombinedOverrides.tsv')
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .filter((line) => line !== '' && !line.startsWith('#'))
        .map(parseCombinedFamilyOverrideLine)
        .filter((override): override is CombinedFamilyOverride => override != null),
    )
    .catch((err) => console.error('Error loading TSV:', err));
}

function parseCombinedFamilyOverrideLine(line: string): CombinedFamilyOverride | null {
  const parts = line.split('\t');
  const parentLanguageCode = parts[0];
  if (parentLanguageCode === HEADER_PARENT_COLUMN) return null;

  const childLanguageCode = parts[1];
  return { parentLanguageCode, childLanguageCode };
}

/**
 * Apply manual Combined-family overrides after ISO and Glottolog data have been merged.
 * Only Combined.parentLanguageCode is modified; ISO and Glottolog sources are unchanged.
 */
export function applyCombinedFamilyOverrides(
  languages: LanguageDictionary,
  overrides: CombinedFamilyOverride[],
): void {
  overrides.forEach((override) => {
    setCombinedParent(languages, override.childLanguageCode, override.parentLanguageCode);
  });
}

function setCombinedParent(
  languages: LanguageDictionary,
  childLanguageCode: LanguageCode,
  parentLanguageCode: LanguageCode,
): void {
  const child = languages[childLanguageCode];
  const parent = languages[parentLanguageCode];
  if (child == null || parent == null) {
    console.debug(
      `Combined family override: child ${childLanguageCode} or parent ${parentLanguageCode} not found`,
    );
    return;
  }
  if (!child.Combined || !parent.Combined) {
    console.debug(
      `Combined family override: missing Combined source for ${childLanguageCode} or ${parentLanguageCode}`,
    );
    return;
  }
  child.Combined.parentLanguageCode = parentLanguageCode;
}
