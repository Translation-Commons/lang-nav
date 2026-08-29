import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import EntityMap from '@features/map/EntityMap';
import InternalLink from '@features/params/InternalLink';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { ColorGradient } from '@features/transforms/coloring/ColorTypes';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';

const LanguageTerritoriesSection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { languageScopes } = usePageParams();
  if (lang.locales.length === 0) return null;

  const params: Partial<PageParams> = {
    entType: EntityType.Locale,
    languageFilter: lang.nameCanonical + ' [' + lang.ID + ']',
    sortBy: Field.PercentOfTerritoryPopulation,
    colorBy: Field.PercentOfTerritoryPopulation,
    colorGradient: ColorGradient.SequentialBlue,
    searchString: '',
    view: View.Map,
  };
  if (lang.scope && !languageScopes.includes(lang.scope))
    params.languageScopes = [...languageScopes, lang.scope];

  return (
    <DetailsSection title="Territories">
      <div>
        This map shows all territories with this language, colored by the percentage of the
        territory&apos;s population that uses it. Hover to see values.{' '}
        <InternalLink className="inline" params={params}>
          [See full map in explore panel]
        </InternalLink>
      </div>
      <LocalParamsProvider overrides={params}>
        <EntityMap entities={lang.locales} maxWidth={1000} />
      </LocalParamsProvider>
    </DetailsSection>
  );
};

export default LanguageTerritoriesSection;
