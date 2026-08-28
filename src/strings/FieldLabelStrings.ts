import { EntityType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getFieldLabel(field: Field, entType: EntityType): string {
  switch (field) {
    case Field.Code:
      return entType + ' code';

    case Field.Name:
    case Field.Endonym:
      return '';

    // Scope
    case Field.LanguageScope:
      return 'Language Level';
    case Field.WritingSystemScope:
    case Field.TerritoryScope:
    case Field.VariantType:
    case Field.SourceType:
      return '';

    // Statuc
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

    // Statuc
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
