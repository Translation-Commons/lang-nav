import { DataGetters } from '@features/data/context/useDataContext';

import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import { parseLocaleCode } from '@entities/locale/LocaleParsing';
import type { TechnologyData, TechSupportData } from '@entities/tech/TechnologyTypes';

const FILES = [
  'data/google/android.tsv',
  'data/google/gtranslate.tsv',
  'data/ml_tsvs/claude.tsv',
  'data/ml_tsvs/mstranslator.tsv',
  'data/grammar_checking/grammarly.tsv',
  'data/grammar_checking/languagetool.tsv',
  'data/grammar_checking/quillbot.tsv',
  'data/other_sources/ios.tsv',
  'data/other_sources/macos.tsv',
  'data/other_sources/win11_language_packs.tsv',
];

export async function loadTechnologySupport(dc: DataGetters): Promise<void> {
  await Promise.all(FILES.map((file) => loadOneTechnologySupport(file, dc)));
}

async function loadOneTechnologySupport(file: string, dc: DataGetters): Promise<void> {
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

      const columns = findColumns(lines);

      // Add relations to the language
      const languageLines = lines.filter((line) => line.trim() !== '' && !line.startsWith('#'));
      languageLines.forEach((line) => addSupportToLanguages(tech, line, dc, columns));
    })
    .catch((err) => {
      console.error(`Error loading data from ${file}:`, err);
    });
}

function getMetadata(lines: string[], key: string): string | undefined {
  return (
    lines
      .find((line) => line.startsWith(`#${key}`))
      ?.replace(`#${key}`, '')
      .trim() || undefined
  );
}

type ColIndices = {
  Code: number;
  Name: number;
  Score: number;
  Territory: number;
  WritingSystem: number;
  Notes: number;
};

function findColumns(lines: string[]): ColIndices {
  const headerLine = lines.find(
    (line) => line.startsWith('Language Code') || line.startsWith('Code'),
  );
  if (!headerLine)
    return {
      Code: -1,
      Name: -1,
      Score: -1,
      Territory: -1,
      WritingSystem: -1,
      Notes: -1,
    };

  const columns = headerLine.split('\t').map((s) => s.trim());

  return {
    Code: columns.findIndex((col) => col === 'Code' || col === 'Language Code'),
    Name: columns.findIndex(
      (col) => col === 'Name' || col === 'Language' || col === 'Language Name',
    ),
    Score: columns.findIndex((col) => col === 'Score'),
    Territory: columns.findIndex((col) => col === 'Territory' || col === 'Locale'),
    WritingSystem: columns.findIndex((col) => col === 'Writing System' || col === 'Script'),
    Notes: columns.findIndex((col) => col === 'Notes'),
  };
}

/**
 * File format:
 * Language Code\tLanguage\tLocale\tWriting System\tNotes
 */
function addSupportToLanguages(
  tech: TechnologyData,
  line: string,
  dc: DataGetters,
  columns: ColIndices,
): void {
  const parts = line.split('\t');
  if (parts.length < 2) return;

  const languageCodePath = (parts[columns.Code] ?? '').trim();
  if (languageCodePath === '' || languageCodePath === 'Language Code') return;
  let locale = undefined;
  if (languageCodePath.match('[_-]')) {
    // It contains writing system and/or regions in the ID
    // Currently not compatible with slashes
    locale = parseLocaleCode(languageCodePath);
  }

  // Extract fields
  const languageCodes = getLanguageCodes(locale ? locale.languageCode : languageCodePath);
  const score = (parts[columns.Score] ?? '').trim() || undefined;

  const techSupportBase: TechSupportData = {
    techShortName: tech.codeDisplay,
    languageCodePath,
    name: (parts[columns.Name] ?? '').trim(),
    territoryCode: locale?.territoryCode ?? ((parts[columns.Territory] ?? '').trim() || undefined),
    writingSystemCode:
      locale?.scriptCode ?? ((parts[columns.WritingSystem] ?? '').trim() || undefined),
    notes: (parts[columns.Notes] ?? '').trim() || undefined,
    score: score != null ? parseFloat(score) : undefined,

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

function getLanguageCodes(languageCodePath: string): string[] {
  // TODO standardize
  // Often sources indicate 1 language code when its support technically applies to multiple ones. This handles that
  // Note that usually 2-letter and 3-letter codes are interchangeable
  switch (languageCodePath) {
    case 'ara':
    case 'ar':
    case 'arb':
      return ['ara', 'arb'];
    case 'zh':
    case 'zho':
    case 'cmn':
      return ['zho', 'cmn'];
    case 'lah':
    case 'pnb':
      return ['lah', 'pnb'];
    case 'ms':
    case 'msa':
    case 'zsm':
      return ['msa', 'zsm'];
    case 'tl':
    case 'tgl':
    case 'fil':
      return ['tgl', 'fil'];
    case 'sw':
    case 'swa':
    case 'swh':
      return ['swa', 'swh'];
    case 'or':
    case 'ori':
    case 'ory':
      return ['ori', 'ory'];
    case 'uz':
    case 'uzb':
    case 'uzn':
      return ['uzb', 'uzn'];
    case 'npi':
    case 'nep':
    case 'ne':
      return ['npi', 'nep'];
    case 'raj':
    case 'mwr':
      return ['raj', 'mwr'];
    case 'mlg':
    case 'plt':
      return ['mlg', 'plt'];
    case 'az':
    case 'aze':
    case 'azj':
      return ['aze', 'azj'];
    case 'no':
    case 'nor':
    case 'nb':
    case 'nob':
      return ['nor', 'nob'];
    case 'sq':
    case 'sqi':
    case 'als':
      return ['sqi', 'als'];
    case 'fa':
    case 'fas':
    case 'pes':
      return ['fas', 'pes'];
  }
  return languageCodePath.split('/');
}
