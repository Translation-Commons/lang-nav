import { TechScope } from '@entities/tech/TechnologyTypes';

export function parseTechScope(scope: string): TechScope {
  switch (scope.toLowerCase().replace(' ', '')) {
    case 'operatingsystem':
    case 'os':
      return TechScope.OperatingSystem;
    case 'product':
      return TechScope.Product;
    case 'application':
    case 'app':
      return TechScope.Application;
    case 'machinelearning':
    case 'machinelearningmodel':
    case 'ml':
      return TechScope.MachineLearningModel;
    case 'inputmethod':
    case 'input':
      return TechScope.InputMethod;
    case 'database':
    case 'db':
      return TechScope.Database;
    default:
      return TechScope.Unknown;
  }
}
