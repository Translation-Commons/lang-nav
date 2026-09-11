import { EntityType, LocaleSeparator } from '@features/params/PageParamTypes';

import { getLocaleCodeFromTags, parseLocaleCode } from '@entities/locale/LocaleParsing';
import {
  LocaleData,
  LocaleSource,
  OfficialStatus,
  PopulationSourceCategory,
} from '@entities/locale/LocaleTypes';

import { isApiEnabled } from '../api/apiConfig';
import { loadLocalesFromApi } from '../api/loadLocalesFromApi';

import { loadEntitiesFromFile } from './loadEntitiesFromFile';

export async function loadLocales(): Promise<Record<string, LocaleData> | void> {
  // The file path is kept, not replaced. With VITE_API_URL unset - the default,
  // and how anyone without a database runs the app - this is unchanged, and it
  // is also the side the parity test compares against.
  //
  // Falls back to the TSV file on any API failure, matching organizations,
  // writing systems and keyboards, instead of leaving the app stuck on
  // CoreData's blocking "Error loading data" alert. Locales have no
  // supplemental files layered on top the way territory does, so there is no
  // equivalent skip logic to keep in step with this fallback.
  if (isApiEnabled()) {
    const fromApi = await loadLocalesFromApi();
    if (fromApi != null) {
      return fromApi;
    }
    console.warn('Locale API load failed; falling back to TSV files.');
  }
  return await loadEntitiesFromFile<LocaleData>('data/tc/locales.tsv', parseLocaleLine);
}

export function parseLocaleLine(line: string): LocaleData | undefined {
  const parts = line.split('\t');
  if (parts.length === 1 && parts[0] === '') {
    // Empty line, ignore
    return undefined;
  } else if (parts.length !== 6) {
    console.error(`Locale line not the right length, ${parts.length} parts: ${line}`);
    return undefined;
  }
  const inputLocaleID = parts[0];
  const localeParts = parseLocaleCode(inputLocaleID);
  const { languageCode, scriptCode, territoryCode, variantCodes } = localeParts;
  const localeID = getLocaleCodeFromTags(localeParts, LocaleSeparator.Underscore);
  const nameEndonym = parts[2] || undefined;
  const population = parts[4] !== '' ? Number.parseInt(parts[4]?.replace(/,/g, '')) : undefined;

  return {
    type: EntityType.Locale,
    ID: localeID,
    codeDisplay: localeID,
    localeSource: LocaleSource.StableDatabase,

    nameDisplay: parts[1],
    nameEndonym: parts[2] || undefined,
    names: [parts[1], nameEndonym].filter((s) => s != null),
    languageCode,
    territoryCode,
    scriptCode,
    variantCodes,
    officialStatus: (parts[5] || undefined) as OfficialStatus | undefined,
    pop: {
      speaking: {
        unadjusted: population,
        source: parts[3] as PopulationSourceCategory | undefined,
      },
      writing: {},
      rough: population,
    },
  };
}
