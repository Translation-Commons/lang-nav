import { DataContextType } from '@features/data/context/useDataContext';

import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import type { TechnologyData, TechSupportData } from '@entities/tech/TechnologyTypes';

const FILES = [
  'data/google/android.tsv',
  'data/google/gtranslate.tsv',
  'data/other_sources/ios.tsv',
  'data/other_sources/macos.tsv',
  'data/other_sources/win11_language_packs.tsv',
];

export async function loadTechnologySupport(dc: DataContextType): Promise<void> {
  for (const file of FILES) {
    try {
      await fetch(file)
        .then((res) => res.text())
        .then((text) => text.split('\n'))
        .then((lines) => {
          // Get the metadata
          const techShortName = getMetadata(lines, 'tech');
          const url = getMetadata(lines, 'url');
          const dateAccessed = getMetadata(lines, 'dateAccessed');
          if (!techShortName) {
            console.error(`Missing tech short name in file ${file}.`);
            return;
          }
          const tech = dc.getTechnology(techShortName);
          if (!tech) {
            console.error(`Technology with short name ${techShortName} not found.`);
            return;
          }
          // TODO: collect metadata in a Document entity of sorts
          tech.languageSupportLastUpdated = dateAccessed ? new Date(dateAccessed) : undefined;
          tech.languageSupportURL = url;

          // Add relations to the language
          const languageLines = lines.filter((line) => line.trim() !== '' && !line.startsWith('#'));
          languageLines.forEach((line) => addSupportToLanguages(tech, line, dc));
        });
    } catch (err) {
      console.error(`Error loading data from ${file}:`, err);
    }
  }
}

function getMetadata(lines: string[], key: string): string | undefined {
  return (
    lines
      .find((line) => line.startsWith(`#${key}`))
      ?.replace(`#${key}`, '')
      .trim() || undefined
  );
}

/**
 * File format:
 * Language Code\tLanguage\tLocale\tWriting System\tNotes
 */
function addSupportToLanguages(tech: TechnologyData, line: string, dc: DataContextType): void {
  const parts = line.split('\t');
  if (parts.length < 2) return;

  const languageCodePath = (parts[0] ?? '').trim();
  if (languageCodePath === '' || languageCodePath === 'Language Code') return;

  // Extract fields
  const languageCodes = languageCodePath.split('/');

  const techSupportBase: TechSupportData = {
    techShortName: tech.codeDisplay,
    languageCodePath,
    name: (parts[1] ?? '').trim(),
    territoryCode: (parts[2] ?? '').trim() || undefined,
    writingSystemCode: (parts[3] ?? '').trim() || undefined,
    notes: (parts[4] ?? '').trim() || undefined,

    tech,
  };
  if (techSupportBase.writingSystemCode)
    techSupportBase.writingSystem = dc.getWritingSystem(techSupportBase.writingSystemCode);
  if (techSupportBase.territoryCode)
    techSupportBase.territory = dc.getTerritory(techSupportBase.territoryCode);

  // Assign to languages
  languageCodes.forEach((code) => {
    if (isIgnoredLanguageCode(code)) return;

    const lang = dc.getLanguage(code);
    if (!lang) return;
    const support = { ...techSupportBase, lang };

    if (!lang.techSupport) lang.techSupport = [];
    lang.techSupport.push(support);
    if (!tech.languageSupport) tech.languageSupport = [];
    tech.languageSupport.push(support);
  });
}
