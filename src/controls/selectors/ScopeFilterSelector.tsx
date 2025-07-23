import React from 'react';

import { joinOxfordComma, toSentenceCase } from '../../generic/stringUtils';
import { ObjectType } from '../../types/PageParamTypes';
import { ScopeLevel } from '../../types/ScopeLevel';
import { getObjectTypeLabelPlural } from '../../views/common/getObjectName';
import MultiChoiceOptions from '../components/MultiChoiceOptions';
import Selector, { SelectorAppearance } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const ScopeFilterSelector: React.FC = () => {
  const { scopes, updatePageParams, objectType } = usePageParams();

  function getOptionDescription(scope: ScopeLevel | ScopeLevel[]): string {
    if (Array.isArray(scope)) {
      return toSentenceCase(
        joinOxfordComma(scope.map((s) => getScopeLevelDescription(objectType, s, 'long'))),
      );
    }
    return toSentenceCase(getScopeLevelDescription(objectType, scope, 'long'));
  }
  function getOptionLabel(scope: ScopeLevel): string {
    return toSentenceCase(getScopeLevelDescription(objectType, scope, 'short'));
  }
  const selectorDescription = `Filter the ${getObjectTypeLabelPlural(objectType)} shown by the granularity of the code -- eg. grouped objects, individual objects, or parts of objects.`;

  return (
    <Selector
      selectorLabel="Scope"
      selectorDescription={selectorDescription}
      appearance={SelectorAppearance.List}
    >
      <MultiChoiceOptions
        mode="flat"
        options={Object.values(ScopeLevel)}
        onToggleOption={(scope: ScopeLevel) =>
          scopes.includes(scope)
            ? updatePageParams({ scopes: scopes.filter((s) => s != scope) })
            : updatePageParams({ scopes: [...scopes, scope] })
        }
        selected={scopes}
        getOptionLabel={getOptionLabel}
        getOptionDescription={getOptionDescription}
      />
    </Selector>
  );
};

export function getScopeLevelDescription(
  objectType: ObjectType,
  scope: ScopeLevel,
  length: 'long' | 'short',
): string {
  switch (objectType) {
    case ObjectType.Census: // Census scope level is just used to filter the languages in the census language table.
    case ObjectType.Language:
      switch (scope) {
        case ScopeLevel.Groups:
          return 'language families';
        case ScopeLevel.Individuals:
          return length === 'long' ? 'languages (including macrolanguages)' : 'languages';
        case ScopeLevel.Parts:
          return 'dialects';
        case ScopeLevel.Other:
          return length === 'long' ? 'special codes or unlabeled languages' : 'special codes';
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.Locale:
      switch (scope) {
        case ScopeLevel.Groups:
          return 'regional locales';
        case ScopeLevel.Individuals:
          return 'regular locales';
        case ScopeLevel.Parts:
          return length === 'long' ? 'locales with additional variant tags' : 'variant locales';
        case ScopeLevel.Other:
          return length === 'long' ? 'special codes or unlabeled locales' : 'special codes';
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.Territory:
      switch (scope) {
        case ScopeLevel.Groups:
          return length === 'long' ? 'continents, regions' : 'continents';
        case ScopeLevel.Individuals:
          return 'countries';
        case ScopeLevel.Parts:
          return 'dependencies';
        case ScopeLevel.Other:
          return length === 'long' ? 'special codes or unlabeled territories' : 'special codes';
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.WritingSystem:
      switch (scope) {
        case ScopeLevel.Groups:
          return length === 'long'
            ? 'script codes that includes multiple scripts'
            : 'script groups';
        case ScopeLevel.Individuals:
          return 'major scripts';
        case ScopeLevel.Parts:
          return 'script variations';
        case ScopeLevel.Other:
          return 'special codes';
      }
  }
}

export default ScopeFilterSelector;
