import React from 'react';

import { joinOxfordComma, toSentenceCase } from '../../generic/stringUtils';
import { Granularity } from '../../types/GranularityTypes';
import { ObjectType } from '../../types/PageParamTypes';
import { getObjectTypeLabelPlural } from '../../views/common/getObjectName';
import { LanguageScopesDescription } from '../../views/language/LanguageScopeDescription';
import MultiChoiceOptions from '../components/MultiChoiceOptions';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const GranularitySelector: React.FC = () => {
  const { granularities, updatePageParams, objectType } = usePageParams();

  function getOptionDescription(granularity: Granularity | Granularity[]): string {
    if (Array.isArray(granularity)) {
      return toSentenceCase(
        joinOxfordComma(granularity.map((s) => getGranularityLabel(objectType, s, 'long'))),
      );
    }
    return toSentenceCase(getGranularityLabel(objectType, granularity, 'long'));
  }
  function getOptionLabel(granularity: Granularity): string {
    return toSentenceCase(getGranularityLabel(objectType, granularity, 'short'));
  }
  const selectorDescription = `Filter the ${getObjectTypeLabelPlural(objectType)} shown by the granularity of the code -- eg. grouped objects, individual objects, or parts of objects.`;

  return (
    <Selector
      selectorLabel="Granularity:"
      selectorDescription={
        objectType == ObjectType.Language ? <LanguageScopesDescription /> : selectorDescription
      }
    >
      <MultiChoiceOptions
        options={Object.values(Granularity)}
        onToggleOption={(granularity: Granularity) =>
          granularities.includes(granularity)
            ? updatePageParams({ granularities: granularities.filter((s) => s != granularity) })
            : updatePageParams({ granularities: [...granularities, granularity] })
        }
        selected={granularities}
        getOptionLabel={getOptionLabel}
        getOptionDescription={getOptionDescription}
      />
    </Selector>
  );
};

export function getGranularityLabel(
  objectType: ObjectType,
  granularity: Granularity,
  length: 'long' | 'short',
): string {
  switch (objectType) {
    case ObjectType.Census: // Census granularity is just used to filter the languages in the census language table.
    case ObjectType.Language:
      switch (granularity) {
        case Granularity.Macro:
          return 'language families';
        case Granularity.Base:
          return length === 'long' ? 'languages (including macrolanguages)' : 'languages';
        case Granularity.Micro:
          return 'dialects';
        case Granularity.Special:
          return length === 'long' ? 'special codes or unlabeled languages' : 'special codes';
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.Locale:
      switch (granularity) {
        case Granularity.Macro:
          return 'regional locales';
        case Granularity.Base:
          return 'regular locales';
        case Granularity.Micro:
          return length === 'long' ? 'locales with additional variant tags' : 'variant locales';
        case Granularity.Special:
          return length === 'long' ? 'special codes or unlabeled locales' : 'special codes';
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.Territory:
      switch (granularity) {
        case Granularity.Macro:
          return length === 'long' ? 'continents, regions' : 'continents';
        case Granularity.Base:
          return 'countries';
        case Granularity.Micro:
          return 'dependencies';
        case Granularity.Special:
          return length === 'long' ? 'special codes or unlabeled territories' : 'special codes';
      }
    // eslint-disable-next-line no-fallthrough
    case ObjectType.WritingSystem:
      switch (granularity) {
        case Granularity.Macro:
          return length === 'long'
            ? 'script codes that includes multiple scripts'
            : 'script groups';
        case Granularity.Base:
          return 'major scripts';
        case Granularity.Micro:
          return 'script variations';
        case Granularity.Special:
          return 'special codes';
      }
  }
}

export default GranularitySelector;
