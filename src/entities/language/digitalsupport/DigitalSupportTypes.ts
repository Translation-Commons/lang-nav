/**
 * This file provides the DigitalSupportScore type and a function to compute it.
 * The DigitalSupportScore type represents various aspects of digital support for a language,
 * with each aspect scored on a scale from 0 to 10.
 */
export type DigitalSupportScore = Record<DigitalSupportDimension, number>;

export enum DigitalSupportDimension {
  Overall = 'overall',
  Keyboards = 'keyboards',
  Documentation = 'documentation',
  I18nFrameworks = 'i18nFrameworks',
  MachineTranslation = 'machineTranslation',
  Interfaces = 'interfaces',
}

export enum WikipediaStatus {
  Active = 'Active',
  Closed = 'Closed',
  Incubator = 'Incubator',
}

export type WikipediaData = {
  titleEnglish: string;
  titleLocal: string;
  status: WikipediaStatus;
  languageName: string;
  scriptCodes: string[]; // e.g. "Latn", "Cyrl", "Arab"
  wikipediaSubdomain: string; // eg. en, fr, simple, zh-classical, map-bms
  localeCodes: string; // eg. eng, fra, mis, lzh, jav/bany1247
  articles: number;
  activeUsers: number;
  url: string;
};

export type UniversalDeclarationOfHumanRightsData = {
  languageCodePath: string; // e.g. "som/afas1238" for the Af-Marka dialect of Somali
  name: string; // e.g. "Af Marka"
  variant: string; // e.g. "Latn", "Cyrl", or "" for undifferentiated
  documentURL: string; // URL to the UDHR translation document -- maybe just the final path segment, like "af-marka" in "https://www.ohchr.org/en/human-rights/universal-declaration/translations/af-marka"
};

export type PlatformSupportData = {
  languageCodePath: string; // e.g. "man/bam" when Google lists grouped or alternate code paths
  name: string;
  locale?: string;
  writingSystem?: string;
  notes?: string;
};
