import { ObjectType } from '@features/params/PageParamTypes';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { LanguageData, LanguageModality } from '@entities/language/LanguageTypes';
import { ObjectData, OfficialStatus } from '@entities/types/DataTypes';

// Customized for UNESCO use
export function prepareUNESCODataForExport(objects: ObjectData[], territoryFilter: string): string {
  const territoryCode = (
    territoryFilter.split('[')[1]?.slice(0, 2) || territoryFilter
  ).toUpperCase();

  return objects
    .filter((obj) => obj.type === ObjectType.Language)
    .map((lang) => getLanguageUNESCOData(lang, territoryCode))
    .sort((a, b) => {
      const aPop = (a[0] as number) || 0;
      const bPop = (b[0] as number) || 0;
      return bPop - aPop;
    }) // Sort by number of users descending
    .map((row) => row.slice(1).join('\t'))
    .join('\n');
}

function getLanguageUNESCOData(
  lang: LanguageData,
  territoryCode: string,
): (number | string | boolean | undefined)[] {
  const locale = lang.locales.find((l) => l.territoryCode === territoryCode);
  const pops = locale?.censusRecords?.map((record) => record.populationEstimate) ?? [];
  const popRange =
    pops.length > 1
      ? Math.min(...pops).toLocaleString() + ' - ' + Math.max(...pops).toLocaleString()
      : '';
  let popYear = locale?.populationCensus?.yearCollected.toString();
  if (locale?.populationCensus?.collectorType === CensusCollectorType.CLDR) popYear = '';
  const hasWritingSystem = lang.primaryWritingSystem && lang.primaryWritingSystem.ID !== 'Zxxx';
  let popSource = locale?.populationCensus?.collectorName ?? locale?.populationSource ?? '';
  if (locale?.populationCensus?.url) popSource += ' ' + locale?.populationCensus?.url;

  return [
    locale?.populationSpeaking, // Used for sorting only
    'WAL-' + lang.ID,
    territoryCode,

    //// Language Information - STEP 1
    // 1. language_names
    lang.nameEndonym ?? lang.nameDisplay,
    lang.nameDisplay,
    '' /* alt names */,

    // 2. language_codes
    lang.ISO.code,
    lang.Glottolog.code,
    '' /* no_code */,

    // 3. modality
    lang.modality?.includes('Spoken'),
    lang.modality?.includes('Sign'),
    lang.modality === LanguageModality.Written ? 'Written Only' : '',

    // 4. recognition_status_of_the_language
    locale?.officialStatus &&
      [OfficialStatus.DeFactoOfficial, OfficialStatus.Official, OfficialStatus.Recognized].includes(
        locale?.officialStatus,
      ),
    (locale?.officialStatus &&
      [OfficialStatus.RecognizedRegionally, OfficialStatus.OfficialRegionally].includes(
        locale?.officialStatus,
      )) ||
      '',
    locale?.officialStatus == null, // no_official_status

    // 5. Indigeneity
    '', // indigenous_language
    '', // not_an_indigenous_language
    '', // unclear

    // 6. Graphisation (refers to development and availability of scripts and orthographic conventions for a language)
    hasWritingSystem ? 'TRUE' : '', // has_writing_system
    hasWritingSystem ? 'FALSE' : '', // no_writing_system

    // 7. Public_funding: Is public funding allocated (either national/federal and/or state/regional/municipal) to protect or promote this language?
    '', // yes
    '', // no
    '', // unknown

    //// Language Use - STEP 2
    // In the communities where the language users are found, is the language typically used in… Choose between: 1. No 2. Partially 3. Yes 4. No information
    '', // primary_education
    '', // secondary_education
    '', // tertiary_education
    '', // media_and_journalism
    '', // digital_spaces

    // Universal Acceptance: Is this language (and its script, if applicable) supported and correctly displayed in digital systems such as websites, domain names, URLs, email addresses, and online applications?
    lang.digitalSupport === 'Thriving' || lang.digitalSupport === 'Vital', // yes
    lang.digitalSupport === 'Ascending' || lang.digitalSupport === 'Emerging', // partially
    lang.digitalSupport === 'Still', // no
    '', // not_sure

    //// Language Users - STEP 3
    // 1. Number: Please provide information about the approximate number of users
    locale?.populationSpeaking?.toLocaleString() ?? '', // Number_of_users
    popRange, // Number_of_users_cited
    popYear ?? '', // Year
    popSource ?? '', // Source

    // 2. Gender distribution of targeted language users: Who are the main users of the targeted language?
    '', // mostly_women
    '', // mostly_men
    '', // both_women_and_men_equally
    '', // people_of_diverse_gender_identities
    '', // not_sure

    // 3. Geographic distribution of users
    '', // On_ the_ whole_ territory_ of_ the_ country_ / Widely_ distributed_ across_ the_ country
    '', // Constrained_ to_ parts_ of_ the_ territory_ / country

    // 4. Generations of users
    '', // All_age_groups
    '', // 0–14_(Children)
    '', // 15–24_(Youth)
    '', // 25–64_(Working-age_adults)
    '', // 65+_(Older_adults_/_Seniors)
    '', // Mixed_age_groups,_but_not_all
    '', // No_information

    // 5. Multilingualism
    '', // monolingual
    '', // Typically_multilingual,_including_other_local_or_national_languages_only
    '', // Typically_multilingual,_including_large_international_languages_only
    '', // Typically_multilingual,_including_both_local_or_national_and_large_international_languages_only
    '', // No_information
  ];
}
