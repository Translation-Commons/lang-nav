/**
 * This file provides asynchronous functions to load in data
 */

import {
  LocaleData,
  ObjectData,
  TerritoryData,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { toDictionary } from '@shared/lib/setUtils';

import { parseLocaleLine, parseWritingSystem } from '../DataParsing';
import { parseTerritoryLine } from '../TerritoryData';

export async function loadLocales(): Promise<Record<string, LocaleData> | void> {
  return await loadObjectsFromFile<LocaleData>('data/locales.tsv', parseLocaleLine);
}

export async function loadWritingSystems(): Promise<Record<string, WritingSystemData> | void> {
  return await loadObjectsFromFile<WritingSystemData>(
    'data/writingSystems.tsv',
    parseWritingSystem,
  );
}

export async function loadTerritories(): Promise<Record<string, TerritoryData> | void> {
  return await loadObjectsFromFile<TerritoryData>('data/territories.tsv', parseTerritoryLine);
}

export async function loadObjectsFromFile<T extends ObjectData>(
  filePath: string,
  parseLine: (line: string) => T | undefined,
): Promise<Record<string, T> | void> {
  return await fetch(filePath)
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1))
    .then((lines) => lines.map(parseLine))
    .then((objects) => objects.filter((obj) => obj != null))
    .then((objects) => toDictionary(objects, (obj) => obj.ID))
    .catch((err) => console.error('Error loading TSV:', err));
}
