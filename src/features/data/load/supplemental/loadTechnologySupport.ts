import { DataGetters } from '@features/data/context/useDataContext';

import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import { parseLocaleCode } from '@entities/locale/LocaleParsing';
import type { TechnologyData, TechSupportData } from '@entities/tech/TechnologyTypes';

const FILES = [
  'data/google/android.tsv',
  'data/google/gtranslate.tsv',
  'data/ml_tsvs/claude.tsv',
  'data/ml_tsvs/mstranslator.tsv',
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

      // Add relations to the language
      const languageLines = lines.filter((line) => line.trim() !== '' && !line.startsWith('#'));
      languageLines.forEach((line) => addSupportToLanguages(tech, line, dc));
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

/**
 * File format:
 * Language Code\tLanguage\tLocale\tWriting System\tNotes
 */
function addSupportToLanguages(tech: TechnologyData, line: string, dc: DataGetters): void {
  const parts = line.split('\t');
  if (parts.length < 2) return;

  const languageCodePath = (parts[0] ?? '').trim();
  if (languageCodePath === '' || languageCodePath === 'Language Code') return;
  let locale = undefined;
  if (languageCodePath.match('[_-]')) {
    // It contains writing system and/or regions in the ID
    // Currently not compatible with slashes
    locale = parseLocaleCode(languageCodePath);
  }

  // Extract fields
  const languageCodes = getLanguageCodes(locale ? locale.languageCode : languageCodePath);

  const techSupportBase: TechSupportData = {
    techShortName: tech.codeDisplay,
    languageCodePath,
    name: (parts[1] ?? '').trim(),
    territoryCode: locale?.territoryCode ?? ((parts[2] ?? '').trim() || undefined),
    writingSystemCode: locale?.scriptCode ?? ((parts[3] ?? '').trim() || undefined),
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

function getLanguageCodes(languageCodePath: string): string[] {
  // TODO standardize
  // Often sources indicate 1 language code when its support technically applies to multiple ones. This handles that
  // Note that usually 2-letter and 3-letter codes are interchangeable
  switch (languageCodePath) {
    case 'ara':
    case 'ar':
      return ['ara', 'arb'];
    case 'zh':
    case 'zho':
      return ['zho', 'cmn'];
    case 'lah':
    case 'pnb':
      return ['lah', 'pnb'];
    case 'ms':
    case 'msa':
      return ['msa', 'zlm'];
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
  }
  return languageCodePath.split('/');
}
