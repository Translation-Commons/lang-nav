import React from 'react';

import usePageParams from '@features/params/usePageParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import getFieldForPopulationFocus from '@features/transforms/fields/getFieldForPopulationFocus';
import { getSortFunction } from '@features/transforms/sorting/sort';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import EntitySubtitle from '@entities/ui/EntitySubtitle';
import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import { uniqueBy } from '@shared/lib/setUtils';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import LanguageDigitalSupportMetascore from './digitalsupport/LanguageDigitalSupportMetascore';
import { LanguageData } from './LanguageTypes';
import { LanguagePopulationEstimate } from './population/LanguagePopulationEstimate';
import LanguageTerritoryList from './relations/LanguageTerritoryList';

interface Props {
  lang: LanguageData;
}

const LanguageCard: React.FC<Props> = ({ lang }) => {
  const sortFunction = getSortFunction();
  const countryLocales = uniqueBy(
    lang.locales.filter((l) => l.territory?.scope === TerritoryScope.Country).sort(sortFunction),
    (l) => l.territoryCode ?? '',
  );
  const { populationFocus } = usePageParams();
  const popField = getFieldForPopulationFocus(populationFocus);
  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Endonym,
    Field.Code,
    Field.Population,
    popField,
    Field.Territory,
    Field.DigitalSupport,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={lang} />
        <EntitySubtitle ent={lang} />
      </div>

      <CardField
        title="Language Type"
        field={Field.LanguageScope}
        description="Whether this is a Language Family, Macrolanguage, Individual Language, or Dialect."
      >
        {getLanguageScopeLabel(lang.scope)}
      </CardField>

      <CardField field={popField}>
        <LanguagePopulationEstimate lang={lang} focus={populationFocus} />
      </CardField>

      <CardField
        title="Digital Support"
        field={Field.DigitalSupport}
        description="An estimate of how well the language is supported digitally, including online presence, software, and digital resources."
      >
        <LanguageDigitalSupportMetascore lang={lang} />
      </CardField>

      {countryLocales.length > 0 && (
        <CardField
          title="Territories"
          field={Field.Territory}
          description="Locations that the language can be found in, sorted by population."
        >
          <LanguageTerritoryList lang={lang} />
        </CardField>
      )}

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={lang} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default LanguageCard;
