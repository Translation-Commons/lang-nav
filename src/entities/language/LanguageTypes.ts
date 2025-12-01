/**
 * This file provides types for the language data used in the application.
 * It includes types for language codes, glottocodes, and language data.
 */

// LanguageCode is ideally an ISO-639 code, or a BCP047 formatted complex language tag
// should be formatted like ab or abc. But there are some languoids with different
// kinds of language codes here as well. This is the main index key for languages and languoids

import React from 'react';

import { RetirementReason } from '@features/data/load/extra_entities/ISORetirements';
import { ObjectType } from '@features/params/PageParamTypes';

import { CLDRCoverageData } from '../types/CLDRTypes';
import {
  LocaleData,
  ObjectBase,
  ScriptCode,
  VariantTagData,
  WikipediaData,
  WritingSystemData,
} from '../types/DataTypes';

import {
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
  LanguageISOStatus,
} from './vitality/VitalityTypes';

export type LanguageDictionary = Record<LanguageCode, LanguageData>;
export type LanguagesBySource = Record<LanguageSource, LanguageDictionary>;

export enum LanguageSource {
  Combined = 'Combined', // All combined, with preferred values
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

export type LanguageVitality = {
  meta?: number; // 0-9 based on other vitality scores
  iso?: LanguageISOStatus; // Derived
  ethFine?: VitalityEthnologueFine; // Computed from other factors
  ethCoarse?: VitalityEthnologueCoarse; // Computed from other factors
  ethnologue2013?: VitalityEthnologueFine; // cited from Ethnologue 2013
  ethnologue2025?: VitalityEthnologueCoarse; // cited from Ethnologue 2025
};

export interface LanguageData extends ObjectBase {
  type: ObjectType.Language;

  // Provided by the TSV files
  ID: LanguageCode; // Stable ID, favors ISO
  codeDisplay: LanguageCode; // Changes with different language source
  scope?: LanguageScope;

  nameCanonical: string; // Stays the same with different language source
  nameDisplay: string; // May update if a language source has a different name
  nameSubtitle?: string;
  nameEndonym?: string;

  vitality?: LanguageVitality;
  digitalSupport?: string;
  viabilityConfidence?: string;
  viabilityExplanation?: string;

  populationAdjusted?: number;
  populationEstimate?: number;
  populationCited?: number; // from languages.tsv
  populationOfDescendants?: number; // computed from child languages
  populationFromLocales?: number; // aggregated from locale data

  modality?: LanguageModality;
  primaryScriptCode?: ScriptCode;

  warnings: Partial<Record<LanguageField, string>>;
  wikipedia?: WikipediaData;

  latitude?: number;
  longitude?: number;

  // References to other objects, filled in after loading the TSV
  locales: LocaleData[];
  primaryWritingSystem?: WritingSystemData;
  writingSystems: Record<ScriptCode, WritingSystemData>;
  parentLanguage?: LanguageData;
  childLanguages: LanguageData[];
  largestDescendant?: LanguageData; // eg. Indo-European -> English, North Germanic -> Swedish
  variantTags?: VariantTagData[]; // links to IANA variant tags

  // Fields that change based on the language source
  Combined: LanguageDataInSource;
  ISO: LanguageDataInSource & {
    code6391?: string;
    status?: LanguageISOStatus;
    retirementReason?: RetirementReason;
  };
  BCP: LanguageDataInSource;
  UNESCO: LanguageDataInSource;
  Glottolog: LanguageDataInSource;
  CLDR: LanguageDataInSource & {
    coverage?: CLDRCoverageData;
    dataProvider?: LanguageData | LocaleData;
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
    variantTags: [],
    locales: [],
    writingSystems: {},
    childLanguages: [],
    warnings: {},

    // Source-specific data
    Combined: {},
    ISO: {},
    BCP: {},
    UNESCO: {},
    Glottolog: {},
    CLDR: {},
  };
}

// Since languages can be categorized by ISO, Glottolog, or other source, these values will vary based on the language source
type LanguageDataInSource = {
  code?: LanguageCode;
  name?: string;
  scope?: LanguageScope;
  populationOfDescendants?: number;
  parentLanguageCode?: LanguageCode;
  parentLanguage?: LanguageData;
  childLanguages?: LanguageData[];
  notes?: React.ReactNode;
};
