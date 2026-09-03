import { EntityType } from '@features/params/PageParamTypes';

import { getRootLanguageFamilyForEntity } from '@entities/language/LanguageFamilyUtils';
import {
  getCountOfCensuses,
  getCountOfKeyboards,
  getCountOfLanguages,
  getCountOfVariants,
  getCountOfWritingSystems,
  getDepth,
  getEntityDateAsNumber,
  getEntityLiteracy,
  getEntityMostImportantLanguageName,
  getWritingSystemsInEntity,
} from '@entities/lib/getEntityMiscFields';
import {
  getEntityPercentOfTerritoryPopulation,
  getEntityPopulation,
  getEntityPopulationDirectlySourced,
  getEntityPopulationOfDescendants,
  getEntityPopulationPercentInBiggestDescendantLanguage,
  getEntityPopulationRelativeToOverallLanguageSpeakers,
  getEntityPopulationSpeaking,
  getEntityPopulationWriting,
} from '@entities/lib/getEntityPopulation';
import {
  getContainingTerritories,
  getCountOfChildTerritories,
  getCountOfCountries,
} from '@entities/lib/getEntityRelatedTerritories';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
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
function getField(ent: EntityData | undefined, field: Field): string | number | undefined {
  if (!ent) return undefined;
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
      return getEntityLiteracy(ent);

    case Field.Coordinates: // Not for sorting, only for display
      if (ent.type === EntityType.Locale) return getField(ent.territory, field);
      return (ent.type === EntityType.Language || ent.type === EntityType.Territory) &&
        ent.latitude != null &&
        ent.longitude != null
        ? ent.latitude?.toFixed(1) + ', ' + ent.longitude?.toFixed(1)
        : undefined;
    case Field.Latitude:
      if (ent.type === EntityType.Locale) return getField(ent.territory, field);
      return ent.type === EntityType.Language || ent.type === EntityType.Territory
        ? ent.latitude
        : undefined;
    case Field.Longitude:
      if (ent.type === EntityType.Locale) return getField(ent.territory, field);
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
      return getEntityMostImportantLanguageName(ent);
    case Field.LanguageFamily:
      return getRootLanguageFamilyForEntity(ent)?.nameDisplay;
    case Field.WritingSystem:
      return getFirstNamePlus(getWritingSystemsInEntity(ent));
    case Field.OutputScript:
      return getKeyboardForEntity(ent)?.outputWritingSystem?.nameDisplay;
    case Field.Region:
      return getTerritoryForEntity(ent)?.parentUNRegion?.nameDisplay;
    case Field.Territory:
      return getFirstNamePlus(
        getContainingTerritories(ent)?.filter(
          (t) => t.scope === TerritoryScope.Country || t.scope === TerritoryScope.Dependency,
        ),
      );
    case Field.Platform:
      return getKeyboardForEntity(ent)?.platform;
    case Field.Variant:
      return getFirstNamePlus(getVariantsForEntity(ent));
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
      return getEntityPopulation(ent);
    case Field.PopulationDirectlySourced:
      return getEntityPopulationDirectlySourced(ent);
    case Field.PopulationSpeaking:
      return getEntityPopulationSpeaking(ent);
    case Field.PopulationWriting:
      return getEntityPopulationWriting(ent);
    case Field.PopulationOfDescendants:
      return getEntityPopulationOfDescendants(ent);
    case Field.PopulationPercentInBiggestDescendantLanguage:
      return getEntityPopulationPercentInBiggestDescendantLanguage(ent);
    case Field.PercentOfTerritoryPopulation:
      return getEntityPercentOfTerritoryPopulation(ent);
    case Field.PercentOfOverallLanguageSpeakers:
      return getEntityPopulationRelativeToOverallLanguageSpeakers(ent);

    // Vitality
    case Field.VitalityMetascore:
      return getLanguageForEntity(ent)?.vitality?.meta;
    case Field.ISOStatus:
      return getLanguageForEntity(ent)?.vitality?.iso;
    case Field.Modality:
      return getLanguageForEntity(ent)?.modality;

    case Field.Date:
      return getEntityDateAsNumber(ent);

    case Field.Description:
      return ent.type === EntityType.Variant ? ent.description : undefined;
    case Field.Example:
      return ent.type === EntityType.WritingSystem ? ent.sample : undefined;

    default:
      enforceExhaustiveSwitch(field);
  }
}

function getFirstNamePlus(ents?: EntityData[]): string | undefined {
  if (!ents || ents.length === 0) return undefined;
  const firstName = ents[0].nameDisplay;
  if (ents.length === 1) return firstName;
  return `${firstName} +${ents.length - 1}`;
}

export default getField;
