import { CensusCollectorType } from '@entities/census/CensusTypes';

import { LocaleData, PopulationSourceCategory } from '../LocaleTypes';

function getLocaleExportString(locale: LocaleData): string {
  let populationSource = '';
  let name = locale.nameDisplay;
  if (!name.includes('(')) name += ` (${locale.territory?.nameDisplay})`;
  if (locale.pop.speaking.census?.collectorType === CensusCollectorType.Government) {
    populationSource = PopulationSourceCategory.Official;
  } else if (locale.pop.speaking.census?.collectorType === CensusCollectorType.Study) {
    populationSource = PopulationSourceCategory.Study;
  }
  return `${locale.ID}\t${name}\t\t${populationSource}\t${locale.pop.speaking.unadjusted}\t${locale.officialStatus ?? ''}\n`;
}
export default getLocaleExportString;
