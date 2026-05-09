import { ObjectType } from '@features/params/PageParamTypes';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadOrganizations(): Promise<Record<string, OrganizationData> | void> {
  return await loadObjectsFromFile<OrganizationData>(
    'data/tc/organizations.tsv',
    parseOrganizationLine,
  );
}

// Short Name	Name	Endonym	Headquarters	Parent	URL
// UN	United Nations		001		https://www.un.org/
// Unicode	Unicode Consortium		US		https://home.unicode.org/
// CLDR	CLDR		US	Unicode	https://cldr.unicode.org/
// UNdata	UNdata		US	UN	https://data.un.org

function parseOrganizationLine(line: string): OrganizationData | undefined {
  const parts = line.split('\t');
  if (line.startsWith('#') || parts.length < 6) return undefined;
  const [codeDisplay, nameDisplay, nameEndonym, headquartersCode, parentCode, url] = parts;

  return {
    type: ObjectType.Org,
    ID: `org.${codeDisplay}`,
    codeDisplay,
    nameDisplay,
    nameEndonym: nameEndonym || undefined,
    url: url || undefined,
    parentID: parentCode ? `org.${parentCode}` : undefined,
    hqID: headquartersCode,
    names: [nameDisplay, nameEndonym].filter((n) => n) as string[],
    censuses: [],
  };
}
