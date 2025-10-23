/**
 * This file provides types for the language data used in the application.
 * It includes types for language codes, glottocodes, and language data.
 */

// LanguageCode is ideally an ISO-639 code, or a BCP047 formatted complex language tag
// should be formatted like ab or abc. But there are some languoids with different
// kinds of language codes here as well. This is the main index key for languages and languoids

import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import { CLDRCoverageData } from '../types/CLDRTypes';
import {
  LocaleData,
  ObjectBase,
  ScriptCode,
  VariantTagData,
  WikipediaData,
  WritingSystemData,
} from '../types/DataTypes';

export type LanguageDictionary = Record<LanguageCode, LanguageData>;
export type LanguagesBySource = Record<LanguageSource, LanguageDictionary>;

export enum LanguageSource {
  All = 'All', // All combined, preferring ISO codes, otherwise Glottocodes
  ISO = 'ISO', // ISO 639-3, 639-5
  BCP = 'BCP', // ISO but preferring 639-1 codes
  UNESCO = 'UNESCO', //  limiting to languages in the UNESCO World Atlas of Languages
  Glottolog = 'Glottolog',
  CLDR = 'CLDR', // ISO but with some CLDR-specific aliasing
}

// TODO Replace generic strings with some form of validation
export type ISO6391LanguageCode = string; // eg. en, es
export type ISO6393LanguageCode = string; // eg. eng, spa
export type ISO6395LanguageCode = string; // eg. ine (Indo-European)
export type ISO6392LanguageCode = ISO6393LanguageCode | ISO6395LanguageCode; // eg. eng, spa, ine
export type Glottocode = string; // eg. abcd1234
export type LanguageCode = ISO6391LanguageCode | ISO6392LanguageCode | Glottocode | string;

export enum LanguageModality {
  Written = 'Written',
  MostlyWritten = 'Mostly Written (also Spoken)',
  SpokenAndWritten = 'Spoken & Written',
  MostlySpoken = 'Mostly Spoken (but also written)',
  Spoken = 'Spoken',
  Sign = 'Sign',
  Understands = 'Understands',
  Reading = 'Reading',
  Uses = 'Uses',
  Ethnicity = 'Ethnicity',
}

export enum LanguageScope {
  Family = 'Family',
  Macrolanguage = 'Macrolanguage',
  Language = 'Language',
  Dialect = 'Dialect',
  SpecialCode = 'Special',
}

// This field enumerates fields about the language that could have additional context.
// Right now it's limited to just warnings, but it should also be used when adding
// the capacity to flag new feedback.
export enum LanguageField {
  isoCode = 'ISO Code',
}

export interface LanguageData extends ObjectBase {
  type: ObjectType.Language;

  // Provided by the TSV files
  ID: LanguageCode; // Stable ID, favors ISO
  codeDisplay: LanguageCode; // Changes with different language source
  codeISO6391?: LanguageCode;
  scope?: LanguageScope;

  nameCanonical: string; // Stays the same with different language source
  nameDisplay: string; // May update if a language source has a different name
  nameSubtitle?: string;
  nameEndonym?: string;

  vitalityISO?: string;
  vitalityEth2013?: string;
  vitalityEth2025?: string;
  digitalSupport?: string;
  viabilityConfidence?: string;
  viabilityExplanation?: string;

  populationAdjusted?: number;
  populationEstimate?: number;
  populationCited?: number; // from languages.tsv
  populationOfDescendents?: number; // computed from child languages
  populationFromLocales?: number; // aggregated from locale data

  modality?: LanguageModality;
  primaryScriptCode?: ScriptCode;

  sourceSpecific: Record<LanguageSource, LanguageDataInSource>;
  cldrCoverage?: CLDRCoverageData;
  variantTags?: VariantTagData[]; // links to IANA variant tags
  cldrDataProvider?: LanguageData | LocaleData;

  warnings: Partial<Record<LanguageField, string>>;
  wikipedia?: WikipediaData;

  // References to other objects, filled in after loading the TSV
  locales: LocaleData[];
  primaryWritingSystem?: WritingSystemData;
  writingSystems: Record<ScriptCode, WritingSystemData>;
  parentLanguage?: LanguageData;
  childLanguages: LanguageData[];
  largestDescendant?: LanguageData; // eg. Indo-European -> English, North Germanic -> Swedish
}

export function getEmptyLanguageSourceSpecificData(): Record<LanguageSource, LanguageDataInSource> {
  return {
    All: { childLanguages: [] },
    ISO: { childLanguages: [] },
    BCP: { childLanguages: [] },
    UNESCO: { childLanguages: [] },
    Glottolog: { childLanguages: [] },
    CLDR: { childLanguages: [] },
  };
}

// Used to create a new language object with minimal data
export function getBaseLanguageData(code: LanguageCode, name: string): LanguageData {
  return {
    type: ObjectType.Language,
    ID: code,
    codeDisplay: code,
    nameCanonical: name,
    nameDisplay: name,
    names: [name],
    sourceSpecific: getEmptyLanguageSourceSpecificData(),
    variantTags: [],
    locales: [],
    writingSystems: {},
    childLanguages: [],
    warnings: {},
  };
}

// Since languages can be categorized by ISO, Glottolog, or other source, these values will vary based on the language source
type LanguageDataInSource = {
  code?: LanguageCode;
  name?: string;
  scope?: LanguageScope;
  populationOfDescendents?: number;
  parentLanguageCode?: LanguageCode;
  parentLanguage?: LanguageData;
  childLanguages: LanguageData[];
  notes?: React.ReactNode;
};
