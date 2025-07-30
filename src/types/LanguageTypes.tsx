/**
 * This file provides types for the language data used in the application.
 * It includes types for language codes, glottocodes, and language data.
 */

// LanguageCode is ideally an ISO-639 code, or a BCP047 formatted complex language tag
// should be formatted like ab or abc. But there are some languoids with different
// kinds of language codes here as well. This is the main index key for languages and languoids

import React from 'react';

import { CensusID } from './CensusTypes';
import { CLDRCoverageData } from './CLDRTypes';
import { LocaleData, ObjectBase, ScriptCode, WritingSystemData } from './DataTypes';
import { ObjectType } from './PageParamTypes';

export type LanguageDictionary = Record<LanguageCode, LanguageData>;
export type LanguagesBySource = Record<LanguageSource, LanguageDictionary>;

export enum LanguageSource {
  All = 'All',
  ISO = 'ISO',
  UNESCO = 'UNESCO',
  Glottolog = 'Glottolog',
  CLDR = 'CLDR',
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
}

export enum LanguageScope {
  Family = 'Family',
  Macrolanguage = 'Macrolanguage',
  Language = 'Language',
  Dialect = 'Dialect',
  SpecialCode = 'Special',
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
  viabilityConfidence: string;
  viabilityExplanation?: string;

  populationAdjusted?: number;
  populationCited?: number;
  populationEstimates?: Record<CensusID, number>;
  populationOfDescendents?: number;

  modality?: LanguageModality;
  primaryScriptCode?: ScriptCode;

  sourceSpecific: Record<LanguageSource, LanguageDataInSource>;
  cldrCoverage?: CLDRCoverageData;
  cldrDataProvider?: LanguageData | LocaleData;

  // References to other objects, filled in after loading the TSV
  locales: LocaleData[];
  primaryWritingSystem?: WritingSystemData;
  writingSystems: Record<ScriptCode, WritingSystemData>;
  parentLanguage?: LanguageData;
  childLanguages: LanguageData[];
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
