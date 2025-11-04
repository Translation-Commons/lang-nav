/**
 * This file provides asynchronous functions to load in data
 */

import { LanguageDictionary } from '@entities/language/LanguageTypes';
import {
  BCP47LocaleCode,
  LocaleData,
  ScriptCode,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { parseLanguageLine, parseLocaleLine, parseWritingSystem } from './DataParsing';

export async function loadLanguages(): Promise<LanguageDictionary | void> {
  return await fetch('data/languages.tsv')
    .then((res) => res.text())
    .then((text) => {
      const languages = text.split('\n').slice(1).map(parseLanguageLine);
      return languages.reduce<LanguageDictionary>((languagesByCode, lang) => {
        languagesByCode[lang.ID] = lang;
        return languagesByCode;
      }, {});
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadLocales(): Promise<Record<BCP47LocaleCode, LocaleData> | void> {
  return await fetch('data/locales.tsv')
    .then((res) => res.text())
    .then((text) => {
      return text
        .split('\n')
        .slice(1)
        .map(parseLocaleLine)
        .filter((locale) => locale != null)
        .reduce<Record<BCP47LocaleCode, LocaleData>>((localesByCode, locale) => {
          localesByCode[locale.ID] = locale;
          return localesByCode;
        }, {});
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function loadWritingSystems(): Promise<Record<ScriptCode, WritingSystemData> | void> {
  return await fetch('data/writingSystems.tsv')
    .then((res) => res.text())
    .then((text) => {
      return text
        .split('\n')
        .slice(1)
        .map(parseWritingSystem)
        .reduce<Record<ScriptCode, WritingSystemData>>((writingsystemsByCode, ws) => {
          writingsystemsByCode[ws.ID] = ws;
          return writingsystemsByCode;
        }, {});
    })
    .catch((err) => console.error('Error loading TSV:', err));
}
