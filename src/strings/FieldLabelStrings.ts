import { EntityType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

// To be filled out later
export function getFieldLabel(field: Field, entType: EntityType): string {
  switch (field) {
    case Field.Code:
      return entType + ' code';

    case Field.Name:
      return 'Name';
    case Field.Endonym:
      return 'Endonym';

    // Scope
    case Field.LanguageScope:
      return 'Language Level';
    case Field.WritingSystemScope:
      return 'Writing System Scope';
    case Field.TerritoryScope:
      return 'Territory Type';
    case Field.VariantType:
      return 'Variant Type';
    case Field.SourceType:
      return 'Source Type';

    // Status
    case Field.Modality:
      if (entType === EntityType.Census) return 'Language Use';
      return 'Medium of Use';

    case Field.Indigeneity:
      return 'Indigeneity';
    case Field.HistoricPresence:
      return 'Historic Presence (>1500 CE)';
    case Field.LanguageFormedHere:
      return 'Language Formed Here';
    case Field.GovernmentStatus:
      return 'Government Status';
    case Field.ECRMLProtection:
      return 'ECRML Protection';

    case Field.DigitalSupport:
      return 'Digital Support';
    case Field.CLDRCoverage:
      return 'CLDR Coverage';
    case Field.UnicodeVersion:
      return 'Unicode Version';

    case Field.VitalityMetascore:
      return 'Vitality Metascore';
    case Field.ISOStatus:
      return 'ISO Status';

    // Relation
    case Field.LanguagePrimary:
      if (entType === EntityType.Language) return 'Language';
      if (entType === EntityType.Locale) return 'Language';
      return 'Primary Language';
    case Field.LanguageList:
      return 'Languages';
    case Field.LanguageFamily:
      return 'Language Family';
    case Field.WritingSystem:
      if (entType === EntityType.Keyboard) return 'Input Script';
      return 'Writing System';
    case Field.OutputScript:
      return 'Output Script';
    case Field.Territory:
      if (entType === EntityType.Org) return 'Headquartered In';
      return 'Territory';
    case Field.Region:
      return 'Region';
    case Field.Variant:
      return 'Variant';
    case Field.Platform:
      return 'Platform';
    case Field.Organization:
      return 'Organization';
    case Field.SourceForLanguage:
      return 'Language List / Language Standard';
    case Field.SourceForPopulation:
      return 'Source for Population';

    // CountOf
    case Field.CountOfLanguages:
      if (entType === EntityType.Language) return '# of Languages and Dialects';
      return '# of Languages';
    case Field.CountOfKeyboards:
      return '# of Keyboards';
    case Field.CountOfWritingSystems:
      return '# of Writing Systems';
    case Field.CountOfChildTerritories:
      return '# of Child Territories';
    case Field.CountOfCountries:
      return '# of Countries';
    case Field.CountOfCensuses:
      return '# of Censuses';
    case Field.CountOfVariants:
      return '# of Variants';

    // Quantity
    case Field.Area:
      return 'Area (km²)';
    case Field.Depth:
      return 'Depth';
    case Field.Coordinates:
      return 'Coordinates';
    case Field.Latitude:
      return 'Latitude';
    case Field.Longitude:
      return 'Longitude';
    case Field.Literacy:
      if (entType === EntityType.Locale) return 'Writers %';
      return 'Literacy';

    // Population
    case Field.Population:
      return 'Population';
    case Field.PopulationDirectlySourced:
      return 'Population Directly Sourced';
    case Field.PopulationSpeaking:
      return 'Population Speaking';
    case Field.PopulationWriting:
      return 'Population Writing';
    case Field.PopulationOfDescendants:
      return 'Population of Descendants';

    case Field.PercentOfTerritoryPopulation:
      if (entType === EntityType.Territory) return '% of Current Population';
      return '% of Territory Population';
    case Field.PercentOfOverallLanguageSpeakers:
      return '% of Overall Language Speakers';
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return '% of Population in Biggest Descendant Language';

    // Other
    case Field.Date:
      return 'Date';
    case Field.Description:
      return 'Description';
    case Field.Example:
      return 'Example';

    case Field.None:
      return 'None';

    default:
      enforceExhaustiveSwitch(field);
  }
}

export function getFieldDescription(field: Field, entType: EntityType): string | undefined {
  switch (field) {
    case Field.Code:
      if (entType === EntityType.Language)
        return 'The ISO 639-3 code for the language, otherwise glottolog language code or other proprietary code. Settings may override this display';
      if (entType === EntityType.Org) return 'A short name or acronym for the organization';
      if (entType === EntityType.Territory)
        return 'The ISO 3166 alpha-2 code for the territory. For regions it uses the UN M49 code.';
      if (entType === EntityType.Locale)
        return 'The sequence of subtags identifying this combination of language + other specifiers, generally following the BCP standard. Settings may configure this display.';
      if (entType === EntityType.Census) return 'The LangNav unique ID for the census table.';
      if (entType === EntityType.Keyboard) return 'The LangNav unique ID for the keyboard.';
      return `The identifier code for the ${entType}.`;

    case Field.Name:
      return `The common name in the English speaking world for the ${entType}. Settings may override this display.`;
    case Field.Endonym:
      if (entType === EntityType.Territory)
        return 'The name for this territory in the local language.';
      return `The name for this ${entType} in the native language.`;

    // Scope
    case Field.LanguageScope:
      if (entType === EntityType.Language)
        return 'Whether this is a language family, macrolanguage, individual language, or dialect.';
      return 'The scope of the associated language (family, macrolanguage, ...).';
    case Field.WritingSystemScope:
      if (entType === EntityType.Locale)
        return 'If the writing system is explicitly defined, this is the scope of the writing system (eg. a composite of multiple scripts, a single one, or a variant of a script).';
      return 'While most writing systems are singular alphabets -- some ISO 15924 codes represent combinations of multiple scripts (eg. Jpan including Kanji, Hiragana and Katakana) or variations (Aran is Arabic [Arab] writing using the stylized Nastaliq form).';
    case Field.TerritoryScope:
      return 'The scope of the associated territory (country, dependency, region, continent, etc.).';
    case Field.VariantType:
      return 'Variants have been broadly grouped into 2 different themes: dialect (regional, word choice, ...) or orthographic (spelling, letters used, ...).';
    case Field.SourceType:
      return 'The kind of organization that collected the population data.';

    // Status
    case Field.Modality:
      if (entType === EntityType.Census)
        return 'The way people use the language if provided by the census source. The Mode, Acquisition Order, and/or Domain (e.g. "Speaks, L1, Home").';
      return 'The way people commonly use the language';

    case Field.Indigeneity:
      return 'Whether the language is considered indigenous to the territory. Multiple criteria may apply (eg. creoles, local recognition, historical presence).';
    case Field.HistoricPresence:
      return 'Whether this language, or its andecendents, had been historically established in the area. The cut-off date being around 1450-1500';
    case Field.LanguageFormedHere:
      return 'Whether the language was formed in this area or arrived later from migration.';
    case Field.GovernmentStatus:
      return 'The official status of the language as recognized by the government.';
    case Field.ECRMLProtection:
      return 'The level of protection for the language under the European Charter for Regional or Minority Languages.';

    case Field.DigitalSupport:
      return 'An aggregated measure for how well the language is supported on digital devices.';
    case Field.CLDRCoverage:
      return 'A level corresponding to how many translations are available for this language in the CLDR (Common Locale Data Repository).';
    case Field.UnicodeVersion:
      return 'The version of the Unicode text encoding standard that this writing system was added.';

    case Field.VitalityMetascore:
      return 'An aggregated score representing the vitality of the language, based on multiple factors.';
    case Field.ISOStatus:
      return 'The ISO 639-3 status of the language, indicating its recognition and classification within the ISO standard. Language families take the maximum of their constituents.';

    // Relation
    case Field.LanguagePrimary:
      if (entType === EntityType.Territory) return 'The biggest language in this territory.';
      if (entType === EntityType.WritingSystem)
        return 'The biggest language using this writing system.';
      if (entType === EntityType.Variant) return 'Equivalent language entry for this variant';
      return 'The corresponding language for this entry.';
    case Field.LanguageList:
      if (entType === EntityType.Territory) return 'Languages present in this territory.';
      if (entType === EntityType.WritingSystem) return 'Languages that use this writing system.';
      if (entType === EntityType.Keyboard) return 'Languages this keyboard supports.';
      if (entType === EntityType.Variant) return 'Languages that use this variant.';
      return `The languages relevant to this ${entType}.`;
    case Field.LanguageFamily:
      if (entType === EntityType.Territory) return 'The biggest language family in this territory.';
      return `The language family to which this ${entType} belongs.`;
    case Field.WritingSystem:
      if (entType === EntityType.Territory)
        return 'The biggest writing system used in this territory.';
      if (entType === EntityType.Keyboard)
        return 'The writing system used as the keys in the keyboard to enter text.';
      if (entType === EntityType.Variant)
        return 'The writing system(s) directly associated with this variant.';
      return `The writing system used for this ${entType}.`;
    case Field.OutputScript:
      return 'The writing system used for the output of this keyboard.';

    case Field.Territory:
      if (entType === EntityType.Org) return 'The territory this organization is headquartered in.';
      if (entType === EntityType.Variant)
        return 'The territory(ies) directly associated with this variant.';
      if (entType === EntityType.Census) return 'The territory the census was conducted in.';
      return 'The corresponding territory for this entry.';
    case Field.Region:
      return 'The broader region this entry is in.';
    case Field.Variant:
      if (entType === EntityType.Locale) return 'The IANA langtag variant in this locale.';
      return 'The IANA langtag variant most closely associated with this entry.';
    case Field.Platform:
      // TODO
      // if (entType === EntityType.Language)
      //   return 'The platforms that support this language in the user interface';
      if (entType === EntityType.Keyboard) return 'The platform this keyboard is designed for.';
      return 'The platform this entry is from.';
    case Field.Organization:
      if (entType === EntityType.Locale)
        return 'The organization providing population data for this locale.';
      if (entType === EntityType.Census)
        return 'The organization that conducted the census and/or redistributed the data.';
      return 'The organization providing data for this entry.';
    case Field.SourceForLanguage:
      return 'The language list this entry comes from.';
    case Field.SourceForPopulation:
      return 'The source providing data for the population information in this entry.';

    // CountOf
    case Field.CountOfLanguages:
      if (entType === EntityType.WritingSystem)
        return 'The number of languages written in this writing system.';
      return 'The number of languages associated with this entry.';
    case Field.CountOfKeyboards:
      if (entType === EntityType.WritingSystem)
        return 'The number of keyboards that produce text for this writing system.';
      return 'The number of keyboards associated with this entry.';
    case Field.CountOfWritingSystems:
      return 'The number of writing systems associated with this entry.';
    case Field.CountOfChildTerritories:
      if (entType === EntityType.Territory)
        return 'For countries: the number of dependencies. For regions: the number of direct child territories in the UN hierarchy';
      return 'The number of direct contained territories associated with this entry.';
    case Field.CountOfCountries:
      if (entType === EntityType.WritingSystem)
        return 'The number of countries where people write in languages using this writing system.';
      if (entType === EntityType.Territory)
        return "The number of countries within this territory's boundaries.";
      return 'The number of countries associated with this entry.';
    case Field.CountOfCensuses:
      if (entType === EntityType.Org)
        return 'The number of tables of population information conducted or repackaged by this organization and added to LangNav.';
      return 'The number of census tables with data for this entry.';
    case Field.CountOfVariants:
      return 'The number of IANA variants associated with this entry.';

    // Quantity
    case Field.Area:
      return 'The area of this entry in km².';
    case Field.Depth:
      if (entType === EntityType.Territory)
        return 'The depth in the UN region schema tree where this territory is located.';
      if (entType === EntityType.Locale)
        return 'The number of tags in this locale beyond the language tag';
      return 'The depth of this entry in the family tree.';
    case Field.Coordinates:
      if (entType === EntityType.Locale)
        return 'The geographic coordinates of the center of this territory in which this locale is based.';
      if (entType === EntityType.Language)
        return 'The geographi coordinates of the center of this language -- by either the historic origin or the centroid of current population.';
      return 'The geographic coordinates of the center of this entry.';
    case Field.Latitude:
      if (entType === EntityType.Locale)
        return 'The latitude of the center of this territory in which this locale is based.';
      if (entType === EntityType.Language)
        return 'The latitude of the center of this language -- by either the historic origin or the centroid of current population.';
      return 'The latitude of the center of this entry.';
    case Field.Longitude:
      if (entType === EntityType.Locale)
        return 'The longitude of the center of this territory in which this locale is based.';
      if (entType === EntityType.Language)
        return 'The longitude of the center of this language -- by either the historic origin or the centroid of current population.';
      return 'The longitude of the center of this entry.';
    case Field.Literacy:
      if (entType === EntityType.Territory)
        return 'The number of people in the area that know how to read and write.';
      if (entType === EntityType.Locale)
        return 'The percent of overall language users that write in the language, regardless if they are generally literate.';
      return 'The number of people in this entry that read and write.';

    // Population
    case Field.Population:
      if (entType === EntityType.Territory) return 'The number of people in the area in 2025.';
      if (entType === EntityType.Locale)
        return 'The number of people in this area that speak, write, or sign this language.';
      if (entType === EntityType.Variant)
        return 'The upper bound number of people that could use this variant -- probably much higher than the actual number.';
      if (entType === EntityType.Language)
        return 'The number of people that speak, write, or sign this language';
      if (entType === EntityType.Census)
        return 'The number of people eligible for the language question in this census. It could be every individual in the area, or it could be limited to the number of people age 15+, etc.';
      if (entType === EntityType.WritingSystem)
        return 'The upper bound number of people that could use this writing system, estimated by the number of people use languages that are written in this writing system. The actual number is probably lower.';
      return '';
    case Field.PopulationDirectlySourced:
      if (entType === EntityType.Census)
        return 'The number of people eligible for the language question in this census. It could be every individual in the area, or it could be limited to the number of people age 15+, etc.';
      return 'The number of people corresponding to this entry that comes from an individual, uncorrected external source';
    case Field.PopulationSpeaking:
      if (entType === EntityType.Variant)
        return "The potential amount of people that could speak this variant (based on the language's overall speaking population). This IS an overestimate.";
      return 'The number of people corresponding to this entry that speak this language.';
    case Field.PopulationWriting:
      if (entType === EntityType.Variant)
        return "The potential amount of people that could write in this variant (based on the language's overall writing population). This IS an overestimate.";
      return 'The number of people corresponding to this entry that write in this language.';
    case Field.PopulationOfDescendants:
      return 'The total number of people in the descendants of this entry -- useful for macrolanguages or to debug certain estimates but it is generally not useful.';

    case Field.PercentOfTerritoryPopulation:
      if (entType === EntityType.Locale)
        return 'The percentage of people who speak, write, or sign this language + specifics in this territory.';
      if (entType === EntityType.Territory)
        return "The percentage this territory's parent territory population that is found in this territory.";
      if (entType === EntityType.Census)
        return 'The percent of people eligible for the language question in this census at the time it was conducted -- relative to the current population.';
      return 'The percentage of the population in this territory corresponding to this entry.';
    case Field.PercentOfOverallLanguageSpeakers:
      return 'The percentage of people worldwide that are in this area and use this language.';
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return 'The percent of the contribution of the biggest descendant language to the overall population of this entry.';

    // Other
    case Field.Date:
      if (entType === EntityType.Census) return 'The year this data was collected.';
      if (entType === EntityType.Variant) return 'The date this variant was registered in IANA.';
      return 'The date associated with this territory.';
    case Field.Description:
      return 'A description of this entry.';
    case Field.Example:
      if (entType === EntityType.WritingSystem)
        return 'A single character from this writing system.';
      return 'An example of this entry, such as a character from a writing system.';
    case Field.None:
      return 'Not used.';

    default:
      enforceExhaustiveSwitch(field);
  }
}
