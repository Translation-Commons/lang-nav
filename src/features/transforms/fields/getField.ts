import { EntityType } from '@features/params/PageParamTypes';

import { getRootLanguageFamilyForEntity } from '@entities/language/LanguageFamilyUtils';
import {
  getCountOfCensuses,
  getCountOfKeyboards,
  getCountOfLanguages,
  getCountOfVariants,
  getCountOfWritingSystems,
  getDepth,
  getObjectDateAsNumber,
  getObjectLiteracy,
  getObjectMostImportantLanguageName,
  getWritingSystemsInObject,
} from '@entities/lib/getObjectMiscFields';
import {
  getObjectPercentOfTerritoryPopulation,
  getObjectPopulation,
  getObjectPopulationDirectlySourced,
  getObjectPopulationOfDescendants,
  getObjectPopulationPercentInBiggestDescendantLanguage,
  getObjectPopulationRelativeToOverallLanguageSpeakers,
  getObjectPopulationSpeaking,
  getObjectPopulationWriting,
} from '@entities/lib/getObjectPopulation';
import {
  getContainingTerritories,
  getCountOfChildTerritories,
  getCountOfCountries,
} from '@entities/lib/getObjectRelatedTerritories';
import { EntityData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { getLanguageSourcesForEntity } from '../filtering/filterByEnum';

import Field from './Field';
import {
  getCensusForEntity,
  getKeyboardForEntity,
  getLanguageForEntity,
  getTerritoryForEntity,
  getVariantsForEntity,
  getWritingSystemForEntity,
} from './getEntityConnection';

// Get's a primitive value for a given entity and field, used for sorting and filtering.
// Returns undefined if the field is not applicable to the entity type or if the value is missing.
function getField(ent: EntityData, field: Field): string | number | undefined {
  switch (field) {
    case Field.None:
      return undefined;
    case Field.Code:
      return ent.codeDisplay;
    case Field.Name:
      return ent.nameDisplay;
    case Field.Endonym:
      return ent.nameEndonym;

    case Field.Depth:
      return getDepth(ent);
    case Field.Literacy:
      return getObjectLiteracy(ent);

    case Field.Coordinates: // Not for sorting, only for display
      return (ent.type === EntityType.Language || ent.type === EntityType.Territory) &&
        ent.latitude != null &&
        ent.longitude != null
        ? ent.latitude?.toFixed(1) + ', ' + ent.longitude?.toFixed(1)
        : undefined;
    case Field.Latitude:
      return ent.type === EntityType.Language || ent.type === EntityType.Territory
        ? ent.latitude
        : undefined;
    case Field.Longitude:
      return ent.type === EntityType.Language || ent.type === EntityType.Territory
        ? ent.longitude
        : undefined;
    case Field.Area:
      return ent.type === EntityType.Territory ? ent.landArea : undefined;

    case Field.LanguageScope:
      return getLanguageForEntity(ent)?.scope;
    case Field.WritingSystemScope:
      return getWritingSystemForEntity(ent)?.scope;
    case Field.TerritoryScope:
      return getTerritoryForEntity(ent)?.scope;
    case Field.VariantType:
      return getVariantsForEntity(ent)?.[0]?.variantType;
    case Field.SourceType:
      return getCensusForEntity(ent)?.collectorType;

    case Field.DigitalSupport:
      return ent.type === EntityType.Language ? ent.digitalSupportScore?.overall : undefined;
    case Field.UnicodeVersion:
      return ent.type === EntityType.WritingSystem ? ent.unicodeVersion : undefined;
    case Field.CLDRCoverage:
      return ent.type === EntityType.Language ? ent.CLDR.coverage?.actualCoverageLevel : undefined; // Not yet defined

    case Field.Indigeneity:
      return undefined; // Not yet defined
    case Field.LanguageFormedHere:
      return ent.type !== EntityType.Locale || ent.langFormedHere == null
        ? undefined
        : ent.langFormedHere
          ? 1
          : 0;
    case Field.HistoricPresence:
      return ent.type !== EntityType.Locale || ent.historicPresence == null
        ? undefined
        : ent.historicPresence
          ? 1
          : 0;
    case Field.ECRMLProtection:
      return ent.type === EntityType.Locale ? ent.ecrmlProtection : undefined;
    case Field.GovernmentStatus:
      return ent.type === EntityType.Locale ? ent.officialStatus : undefined; // Not yet defined

    // Related entities
    case Field.Language:
      return getObjectMostImportantLanguageName(ent);
    case Field.LanguageFamily:
      return getRootLanguageFamilyForEntity(ent)?.nameDisplay;
    case Field.WritingSystem:
      return getWritingSystemsInObject(ent)?.[0]?.nameDisplay;
    case Field.OutputScript:
      return getKeyboardForEntity(ent)?.outputWritingSystem?.nameDisplay;
    case Field.Region:
      return getTerritoryForEntity(ent)?.parentUNRegion?.nameDisplay;
    case Field.Territory:
      return getContainingTerritories(ent)?.[0]?.nameDisplay;
    case Field.Platform:
      return getKeyboardForEntity(ent)?.platform;
    case Field.Variant:
      return getVariantsForEntity(ent)?.[0]?.nameDisplay;
    case Field.SourceForPopulation:
      return getCensusForEntity(ent)?.collectorName;
    case Field.SourceForLanguage:
      return getLanguageSourcesForEntity(ent)?.join(', ') || undefined;

    // Counts of Related Objects
    case Field.CountOfLanguages:
      return getCountOfLanguages(ent);
    case Field.CountOfKeyboards:
      return getCountOfKeyboards(ent);
    case Field.CountOfCountries:
      return getCountOfCountries(ent);
    case Field.CountOfChildTerritories:
      return getCountOfChildTerritories(ent);
    case Field.CountOfWritingSystems:
      return getCountOfWritingSystems(ent);
    case Field.CountOfCensuses:
      return getCountOfCensuses(ent);
    case Field.CountOfVariants:
      return getCountOfVariants(ent);

    // Population
    case Field.Population:
      return getObjectPopulation(ent);
    case Field.PopulationDirectlySourced:
      return getObjectPopulationDirectlySourced(ent);
    case Field.PopulationSpeaking:
      return getObjectPopulationSpeaking(ent);
    case Field.PopulationWriting:
      return getObjectPopulationWriting(ent);
    case Field.PopulationOfDescendants:
      return getObjectPopulationOfDescendants(ent);
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return getObjectPopulationPercentInBiggestDescendantLanguage(ent);
    case Field.PercentOfTerritoryPopulation:
      return getObjectPercentOfTerritoryPopulation(ent);
    case Field.PercentOfOverallLanguageSpeakers:
      return getObjectPopulationRelativeToOverallLanguageSpeakers(ent);

    // Vitality
    case Field.VitalityMetascore:
      return getLanguageForEntity(ent)?.vitality?.meta;
    case Field.ISOStatus:
      return getLanguageForEntity(ent)?.vitality?.iso;
    case Field.VitalityEthnologueFine:
      return getLanguageForEntity(ent)?.vitality?.ethFine;
    case Field.VitalityEthnologueCoarse:
      return getLanguageForEntity(ent)?.vitality?.ethCoarse;
    case Field.Modality:
      return getLanguageForEntity(ent)?.modality;

    case Field.Date:
      return getObjectDateAsNumber(ent);

    case Field.Description:
      return ent.type === EntityType.Variant ? ent.description : undefined;
    case Field.Example:
      return ent.type === EntityType.WritingSystem ? ent.sample : undefined;

    default:
      enforceExhaustiveSwitch(field);
  }
}

export default getField;
