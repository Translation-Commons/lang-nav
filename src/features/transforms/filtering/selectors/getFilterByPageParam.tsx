import { EntityType, PageParamKey } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { getFieldLabel } from '@strings/FieldLabelStrings';

export function getFilterFieldByPageParam(pageParameter: PageParamKey): Field {
  switch (pageParameter) {
    case PageParamKey.languageFilter:
      return Field.Language;
    case PageParamKey.languageFamilyFilter:
      return Field.LanguageFamily;
    case PageParamKey.languageScopes:
      return Field.LanguageScope;

    case PageParamKey.territoryFilter:
      return Field.Territory;
    case PageParamKey.territoryScopes:
      return Field.TerritoryScope;

    case PageParamKey.writingSystemFilter:
      return Field.WritingSystem;

    case PageParamKey.orgFilter:
      return Field.Organization;

    case PageParamKey.populationMin:
    case PageParamKey.populationMax:
      return Field.Population;

    case PageParamKey.languageSource:
      return Field.SourceForLanguage;
    case PageParamKey.modalityFilter:
      return Field.Modality;
    case PageParamKey.isoStatus:
      return Field.ISOStatus;

    case PageParamKey.searchString:
      return Field.Name; // More complicated than this

    // Not filters (yet!)
    case PageParamKey.pinned:
      return Field.None;

    // Data visualization dimensions -- not filters
    case PageParamKey.chartX:
    case PageParamKey.chartY:
    case PageParamKey.colorBy:
    case PageParamKey.scaleBy:
    case PageParamKey.sortBy:
    case PageParamKey.secondarySortBy:
    case PageParamKey.fieldFocus:
      return Field.None;

    // Other page parameters -- not filters
    case PageParamKey.cmpID:
    case PageParamKey.entID:
    case PageParamKey.populationFocus:
    case PageParamKey.colorGradient:
    case PageParamKey.columns:
    case PageParamKey.entType:
    case PageParamKey.limit:
    case PageParamKey.localeSeparator:
    case PageParamKey.page:
    case PageParamKey.profile:
    case PageParamKey.reportID:
    case PageParamKey.scaleFactor:
    case PageParamKey.searchBy:
    case PageParamKey.sortBehavior:
    case PageParamKey.view:
      return Field.None;

    default:
      enforceExhaustiveSwitch(pageParameter);
  }
}

export function getFilterLabelByPageParam(
  pageParameter: PageParamKey,
  filteringEntType: EntityType,
): string {
  const field = getFilterFieldByPageParam(pageParameter);
  return getFieldLabel(field, filteringEntType);
}
