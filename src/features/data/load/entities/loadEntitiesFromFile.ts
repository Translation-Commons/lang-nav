/**
 * This file provides asynchronous functions to load in data
 */

import { EntityData } from '@entities/types/DataTypes';

import { toDictionary } from '@shared/lib/setUtils';

export async function loadEntitiesFromFile<T extends EntityData>(
  filePath: string,
  parseLine: (line: string) => T | undefined,
): Promise<Record<string, T> | void> {
  return await fetch(filePath)
    .then((res) => res.text())
    .then((text) => text.split('\n').slice(1))
    .then((lines) => lines.map(parseLine))
    .then((ents) => ents.filter((ent) => ent != null))
    .then((ents) => (ents != null ? toDictionary(ents, (ent) => ent.ID) : undefined))
    .catch((err) => console.error('Error loading TSV:', err));
}
