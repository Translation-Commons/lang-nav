import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import CommaSeparated from '../../generic/CommaSeparated';
import { numberToFixedUnlessSmall } from '../../generic/numberUtils';
import { LocaleData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import {
  CodeColumn,
  EndonymColumn,
  InfoButtonColumn,
  NameColumn,
} from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();

  return (
    <ObjectTable<LocaleData>
      objects={Object.values(locales).filter(
        (locale) => locale.language?.sourceSpecific[languageSource].code != null,
      )}
      columns={[
        CodeColumn,
        NameColumn,
        EndonymColumn,
        {
          key: 'Population',
          render: (object) => object.populationSpeaking,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: '% in Territory',
          render: (object) =>
            object.populationSpeakingPercent &&
            numberToFixedUnlessSmall(object.populationSpeakingPercent),
          isNumeric: true,
          sortParam: SortBy.Percent,
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        {
          key: 'Contained Locales',
          render: (loc) => (
            <CommaSeparated limit={2}>
              {loc.containedLocales?.map((child) => (
                <HoverableObjectName object={child} key={child.ID} />
              ))}
            </CommaSeparated>
          ),
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.CountOfLanguages,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default LocaleTable;
