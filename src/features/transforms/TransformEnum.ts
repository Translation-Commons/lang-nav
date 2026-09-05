import { PageParamKey, PageParams } from '@features/params/PageParamTypes';

enum TransformEnum {
  Sort = 'sort',
  Color = 'color',
  Scale = 'scale',
  Search = 'search',
  Filter = 'filter',
}

export function getTransformForPageParam(key: keyof PageParams): TransformEnum | undefined {
  switch (key) {
    case PageParamKey.fieldFocus:
      return undefined; // Not a transform, available for all data
    case PageParamKey.sortBy:
    case PageParamKey.secondarySortBy:
      return TransformEnum.Sort;
    case PageParamKey.colorBy:
      return TransformEnum.Color;
    case PageParamKey.scaleBy:
      return TransformEnum.Scale;
    case PageParamKey.writingSystemFilter:
    case PageParamKey.languageFilter:
    case PageParamKey.territoryFilter:
    case PageParamKey.languageFamilyFilter:
    case PageParamKey.modalityFilter:
    case PageParamKey.populationMax:
    case PageParamKey.populationMin:
    case PageParamKey.territoryScopes:
    case PageParamKey.languageSource:
    case PageParamKey.languageScopes:
    case PageParamKey.isoStatus:
      return TransformEnum.Filter;
    case PageParamKey.searchString:
      return TransformEnum.Search;
    default:
      throw new Error(`Page parameter not supported for transform: ${key}`);
  }
}

export default TransformEnum;
