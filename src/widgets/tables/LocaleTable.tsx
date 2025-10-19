import React from 'react';

import { useDataContext } from '@features/data-loading/DataContext';
import { usePageParams } from '@features/page-params/usePageParams';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';

import { LocaleData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import { toSentenceCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { LocalePopulationColumns } from './columns/LocalePopulationColumns';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();

  return (
    <ObjectTable<LocaleData>
      objects={locales.filter(
        (locale) => locale.language?.sourceSpecific[languageSource].code != null,
      )}
      columns={[
        CodeColumn,
        NameColumn,
        EndonymColumn,
        ...LocalePopulationColumns,
        {
          key: 'Literacy',
          render: (object) =>
            object.literacyPercent != null
              ? numberToFixedUnlessSmall(object.literacyPercent)
              : null,
          isInitiallyVisible: false,
          isNumeric: true,
          sortParam: SortBy.Literacy,
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
          columnGroup: 'Linked Data',
        },
        {
          key: 'Language',
          render: (object) => <HoverableObjectName object={object.language} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
          sortParam: SortBy.Language,
        },
        {
          key: 'Territory',
          render: (object) => <HoverableObjectName object={object.territory} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Writing System',
          render: (object) => <HoverableObjectName object={object.writingSystem} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Variant Tags',
          render: (object) =>
            object.variantTags && (
              <CommaSeparated limit={1}>
                {object.variantTags.map((vt) => (
                  <HoverableObjectName object={vt} key={vt.ID} />
                ))}
              </CommaSeparated>
            ),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Wikipedia',
          render: (object) => <ObjectWikipediaInfo object={object} size="compact" />,
          isInitiallyVisible: false,
        },
        {
          key: 'Locale Source',
          render: (object) => toSentenceCase(object.localeSource),
          isInitiallyVisible: false,
        },
      ]}
    />
  );
};

export default LocaleTable;
