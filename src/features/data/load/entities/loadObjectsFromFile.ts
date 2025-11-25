/**
 * This file provides asynchronous functions to load in data
 */

import { ObjectData } from '@entities/types/DataTypes';

import { toDictionary } from '@shared/lib/setUtils';

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
