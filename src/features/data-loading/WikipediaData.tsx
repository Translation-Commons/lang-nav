import { LanguageData } from '@entities/language/LanguageTypes';
import {
  BCP47LocaleCode,
  LocaleData,
  ScriptCode,
  WikipediaData,
  WikipediaStatus,
} from '@entities/types/DataTypes';

import { DataContextType } from './DataContext';

export async function loadAndApplyWikipediaData(dataContext: DataContextType): Promise<void> {
  const wikiData = await loadWikipediaData();
  if (wikiData) {
    applyWikipediaData(dataContext.getLanguage, dataContext.getLocale, wikiData);
  }
}

async function loadWikipediaData(): Promise<WikipediaData[] | void> {
  return await fetch('data/wikipedias.tsv')
    .then((res) => res.text())
    .then((text) => {
      return text
        .split('\n')
        .slice(1)
        .map((line) => {
          const parts = line.split('\t');
          return {
            titleEnglish: parts[0],
            titleLocal: parts[1],
            status: parts[2] as WikipediaStatus,
            languageName: parts[3],
            scriptCodes: parts[4] ? (parts[4].split('/') as ScriptCode[]) : [],
            wikipediaSubdomain: parts[5],
            localeCode: parts[6] as BCP47LocaleCode,
            articles: parseInt(parts[7].replace(/,/g, '')),
            activeUsers: parseInt(parts[8].replace(/,/g, '')),
            url: parts[9],
          } as WikipediaData;
        });
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

// Add wikipedia data to corresponding objects (languages, locales)
//
// Note there are a few cases there are multiple Wikipedia, for instance there is
// both a closed Muscogee wikipedia as well as a new one with Incubator status -- the
// former gets overrides by the Incubator one.
export function applyWikipediaData(
  getLanguage: (id: string) => LanguageData | undefined,
  getLocale: (id: string) => LocaleData | undefined,
  wikiData: WikipediaData[],
): void {
  wikiData.forEach((wiki) => {
    // Most Wikipedias simply correspond to a language, eg. eng
    const lang = getLanguage(wiki.localeCode);
    if (lang) {
      lang.wikipedia = wiki;
    }

    // Some have extra locale data eg. bel_tarask
    const locale = getLocale(wiki.localeCode);
    if (locale) {
      locale.wikipedia = wiki;
    }

    // And some can support multiple scripts eg. zh_Hans and zh_Hant
    if (wiki.scriptCodes.length > 0) {
      wiki.scriptCodes.forEach((script) => {
        const scriptLocaleCode = `${wiki.localeCode}_${script}` as BCP47LocaleCode;
        const scriptLocale = getLocale(scriptLocaleCode);
        if (scriptLocale) {
          scriptLocale.wikipedia = wiki;
        }
      });
    }
  });
}
