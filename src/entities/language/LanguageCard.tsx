import React, { useMemo } from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import getFieldForPopulationFocus from '@features/transforms/fields/getFieldForPopulationFocus';
import { useSortFunction } from '@features/transforms/sorting/sort';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { uniqueBy } from '@shared/lib/setUtils';

import LanguageDigitalSupportMetascore from './digitalsupport/LanguageDigitalSupportMetascore';
import type { LanguageData } from './LanguageTypes';
import { LanguagePopulationEstimate } from './population/LanguagePopulationEstimate';
import LanguageTerritoryList from './relations/LanguageTerritoryList';

interface Props {
  lang?: LanguageData;
}

const LanguageCard: React.FC<Props> = ({ lang }) => {
  const sortFunction = useSortFunction();
  const countryLocales = useMemo(
    () =>
      uniqueBy(
        lang?.locales
          .filter((l) => l.territory?.scope === TerritoryScope.Country)
          .sort(sortFunction) ?? [],
        (l) => l.territoryCode ?? '',
      ),
    [lang?.locales, sortFunction],
  );
  const { populationFocus } = usePageParams();
  const popField = getFieldForPopulationFocus(populationFocus);

  return (
    <>
      <CardEntityField field={Field.LanguageScope} ent={lang} />

      <CardField field={popField}>
        <LanguagePopulationEstimate lang={lang} focus={populationFocus} />
      </CardField>

      <CardField field={Field.DigitalSupport}>
        <LanguageDigitalSupportMetascore lang={lang} />
      </CardField>

      {!lang && <CardEntityField field={Field.TerritoryList} />}
      {countryLocales.length > 0 && (
        <CardField field={Field.TerritoryList}>
          <LanguageTerritoryList lang={lang} />
        </CardField>
      )}

      <CardExtraFields
        ent={lang}
        excludeFields={[
          Field.Name,
          Field.Endonym,
          Field.Code,
          Field.Population,
          popField,
          Field.TerritoryList,
          Field.DigitalSupport,
        ]}
      />
    </>
  );
};

export default LanguageCard;
