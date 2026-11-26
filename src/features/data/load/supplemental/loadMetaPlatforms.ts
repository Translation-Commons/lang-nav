import { DataGetters } from '@features/data/context/useDataContext';

import { isIgnoredLanguageCode } from '@entities/census/parseCensusLanguageRow';
import { LocaleTags, parseLocaleCode } from '@entities/locale/LocaleParsing';
import type { TechnologyData, TechSupportData } from '@entities/tech/TechnologyTypes';

export async function loadMetaPlatforms(dc: DataGetters): Promise<void> {
  await fetch('data/other_sources/metaPlatforms.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n'))
    .then((lines) => {
      // Get the metadata
      const techShortName = getMetadata(lines, 'tech');
      const url = getMetadata(lines, 'url');
      const dateAccessed = getMetadata(lines, 'dateAccessed');

      // Get tech entities and add metadata to each
      const techs = techShortName.map((s, i) => {
        if (!s || s.startsWith('#') || s === 'Code') return undefined;
        const tech = dc.getTechnology(s);
        if (!tech) {
          console.error(`Technology with short name ${s} not found.`);
          return undefined;
        }

        tech.languageSupportLastUpdated = dateAccessed[i] ? new Date(dateAccessed[i]) : undefined;
        tech.languageSupportURL = url[i];
        return tech;
      });
      if (!techs.some((t) => t)) {
        console.error('No valid technologies found in metaPlatforms.tsv');
        return;
      }

      // Add relations to the language
      const languageLines = lines.filter((line) => line.trim() !== '' && !line.startsWith('#'));
      languageLines.forEach((line) => addSupportToLanguages(techs, line, dc));
    })
    .catch((err) => {
      console.error(`Error loading data from metaPlatforms.tsv:`, err);
    });
}

function getMetadata(lines: string[], key: string): (string | undefined)[] {
  const line = lines.find((line) => line.startsWith(`#${key}`));
  if (!line) return [];
  return line.split('\t').map((s) => s.trim() || undefined);
}

function addSupportToLanguages(
  techs: (TechnologyData | undefined)[],
  line: string,
  dc: DataGetters,
): void {
  const parts = line.split('\t');
  if (parts.length < 2) return;

  const languageCodePath = (parts[0] ?? '').trim();
  if (languageCodePath === '' || languageCodePath === 'Code') return;

  // For each locale listed & tech column, add the data
  const locales = getLocales(languageCodePath);

  techs.forEach((tech, i) => {
    // If the column is not assigned to a tech or if the column does not positively indicate support with a 'y', skip it
    if (!tech || !parts[i]) return;

    const techSupportBase: TechSupportData = {
      techShortName: tech.codeDisplay,
      languageCodePath: parts[2],
      name: parts[1],

      tech,
    };
    if (techSupportBase.writingSystemCode)
      techSupportBase.writingSystem = dc.getWritingSystem(techSupportBase.writingSystemCode);
    if (techSupportBase.territoryCode)
      techSupportBase.territory = dc.getTerritory(techSupportBase.territoryCode);

    // Assign to languages
    locales.forEach((locale) => {
      const code = locale.languageCode;
      if (isIgnoredLanguageCode(code)) return;

      const lang = dc.getLanguage(code);
      if (!lang) return;
      const support = {
        ...techSupportBase,
        lang,
        territoryCode: locale.territoryCode,
        writingSystemCode: locale.scriptCode,
      };

      if (!lang.techSupport) lang.techSupport = [];
      lang.techSupport.push(support);
      if (!tech.languageSupport) tech.languageSupport = [];
      tech.languageSupport.push(support);
    });
  });
}

function getLocales(languageCodePath: string): LocaleTags[] {
  const localeCodes = languageCodePath.split('/');
  // Eventually we should add locale data as well, but for now we are just handling languages.
  return localeCodes.map(parseLocaleCode);
}
