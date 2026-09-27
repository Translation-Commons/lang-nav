import type { TechnologyData } from '@entities/tech/TechnologyTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { parseTechScope } from '@strings/TechnologyStrings';

import { loadEntitiesFromFile } from './loadEntitiesFromFile';

export async function loadTechnologies(): Promise<Record<string, TechnologyData> | void> {
  return await loadEntitiesFromFile<TechnologyData>(
    'data/tc/technologies.tsv',
    parseTechnologyLine,
  );
}

// code	name	scope	organization	parentTech	relatedTech	population	populationSource
// iOS	iOS	OS	Apple			1,000,000,000	https://searchengineland.com/guide/iphone-vs-android-statistics
// Win11	Windows 11	OS	Microsoft	Windows		1,000,000,000
// fb4a	Facebook for Android	App	Meta	FB	Android	1,849,000,000	computed from stat 60.2% of FB users use their main Android app

function parseTechnologyLine(line: string): TechnologyData | undefined {
  const parts = line.split('\t');

  return {
    type: EntityType.Technology,
    ID: 'platform.' + parts[0],
    codeDisplay: parts[0],
    nameDisplay: parts[1],
    names: [parts[1]],
    scope: parseTechScope(parts[2]),

    population: parts[6] ? parseInt(parts[6].replace(/,/g, '')) : undefined,
    populationSource: parts[7] || undefined,

    organizationCode: parts[3],
    parentTechCode: parts[4] || undefined,
    relatedTechCodes: parts[5].split(',') || undefined,
  };
}
