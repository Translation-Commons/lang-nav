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
      return 'Territory Scope';
    case Field.VariantType:
      return 'Variant Type';
    case Field.SourceType:
      return 'Source Type';

    // Status
    case Field.Modality:
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
    case Field.Language:
      return 'Language';
    case Field.LanguageFamily:
      return 'Language Family';
    case Field.WritingSystem:
      if (entType === EntityType.Keyboard) return 'Input Script';
      return 'Writing System';
    case Field.OutputScript:
      return 'Output Script';
    case Field.Territory:
      return 'Territory';
    case Field.Region:
      return 'Region';
    case Field.Variant:
      return 'Variant';
    case Field.Platform:
      return 'Platform';
    case Field.SourceForLanguage:
      return 'Source for Language';
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

// To be filled out later
export function getFieldDescription(field: Field, entType: EntityType): string | undefined {
  switch (field) {
    case Field.Code:
      return '';

    case Field.Name:
    case Field.Endonym:
      return '';

    // Scope
    case Field.LanguageScope:
      return entType === EntityType.Language
        ? 'Whether this is a language family, macrolanguage, individual language, or dialect.'
        : 'The scope of the associated language (family, macrolanguage, ...).';
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.VariantType:
    case Field.SourceType:
      return '';

    // Status
    case Field.Modality:
      return '';

    case Field.Indigeneity:
    case Field.HistoricPresence:
    case Field.LanguageFormedHere:
    case Field.GovernmentStatus:
    case Field.ECRMLProtection:
      return '';

    case Field.DigitalSupport:
    case Field.CLDRCoverage:
    case Field.UnicodeVersion:
      return '';

    case Field.VitalityMetascore:
    case Field.ISOStatus:
      return '';

    // Relation
    case Field.Language:
    case Field.LanguageFamily:
    case Field.WritingSystem:
    case Field.OutputScript:
    case Field.Territory:
    case Field.Region:
    case Field.Variant:
    case Field.Platform:
    case Field.SourceForLanguage:
    case Field.SourceForPopulation:
      return '';

    // CountOf
    case Field.CountOfLanguages:
    case Field.CountOfKeyboards:
    case Field.CountOfWritingSystems:
    case Field.CountOfChildTerritories:
    case Field.CountOfCountries:
    case Field.CountOfCensuses:
    case Field.CountOfVariants:
      return '';

    // Quantity
    case Field.Area:
    case Field.Depth:
    case Field.Coordinates:
    case Field.Latitude:
    case Field.Longitude:
    case Field.Literacy:
      return '';

    // Population
    case Field.Population:
    case Field.PopulationDirectlySourced:
    case Field.PopulationSpeaking:
    case Field.PopulationWriting:
    case Field.PopulationOfDescendants:
      return '';

    case Field.PercentOfTerritoryPopulation:
    case Field.PercentOfOverallLanguageSpeakers:
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return '';

    // Other
    case Field.Date:
    case Field.None:
    case Field.Description:
    case Field.Example:
      return '';

    default:
      enforceExhaustiveSwitch(field);
  }
}
