import { LanguageData } from '@entities/language/LanguageTypes';
import { LanguageProximityLevel } from '@entities/types/CLDRTypes';

import { getLanguageProximityFromString } from '@strings/LanguageProximityStrings';

type LanguageMatchAnnotationImport = {
  desiredCode: string;
  supportedCode: string;
  mutualIntelligibility?: LanguageProximityLevel;
  bilingualism?: LanguageProximityLevel;
};

export async function loadLanguageMatchAnnotations(
  getCLDRLanguage: (id: string) => LanguageData | undefined,
): Promise<void> {
  await fetch('data/tc/language_match_annotations.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1))
    .then((lines) =>
      lines
        .map(parseLanguageMatchAnnotationLine)
        .filter((entry) => entry != null)
        .forEach((entry) => {
          if (entry == null) return;
          const desiredLanguage = getCLDRLanguage(entry.desiredCode);
          if (desiredLanguage == null) return;
          const desiredMatch = desiredLanguage.CLDR.languageMatch?.find(
            (match) => getPrimaryLanguageSubtag(match.supported) === entry.supportedCode,
          );
          if (desiredMatch == null) return;

          desiredMatch.mutualIntelligibility = entry.mutualIntelligibility;
          desiredMatch.bilingualism = entry.bilingualism;

          // Mutual intelligibility is symmetric, so mirror it when the reverse match exists.
          if (entry.mutualIntelligibility != null) {
            const supportedLanguage = getCLDRLanguage(entry.supportedCode);
            const reverseMatch = supportedLanguage?.CLDR.languageMatch?.find(
              (match) => getPrimaryLanguageSubtag(match.supported) === entry.desiredCode,
            );
            if (reverseMatch != null)
              reverseMatch.mutualIntelligibility = entry.mutualIntelligibility;
          }
        }),
    );
}

function parseLanguageMatchAnnotationLine(line: string): LanguageMatchAnnotationImport | undefined {
  if (line.trim() === '' || line.startsWith('#')) return undefined;
  const [desiredCodeRaw, supportedCodeRaw, miRaw, bilingualismRaw] = line.split('\t');
  const desiredCode = desiredCodeRaw?.trim();
  const supportedCode = supportedCodeRaw?.trim();
  if (!desiredCode || !supportedCode) return undefined;

  return {
    desiredCode,
    supportedCode,
    mutualIntelligibility: getLanguageProximityFromString(miRaw),
    bilingualism: getLanguageProximityFromString(bilingualismRaw),
  };
}

function getPrimaryLanguageSubtag(languageTag: string): string | undefined {
  const primarySubtag = languageTag.split(/[_-]/)[0];
  if (primarySubtag == null || !/^[a-z]{2,3}$/i.test(primarySubtag)) return undefined;
  return primarySubtag;
}
