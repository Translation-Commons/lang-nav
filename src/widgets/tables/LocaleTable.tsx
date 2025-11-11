import React from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import usePageParams from '@features/page-params/usePageParams';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableValueType from '@features/table/TableValueType';

import { LocaleData } from '@entities/types/DataTypes';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import { toSentenceCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { LocalePopulationColumns } from './columns/LocalePopulationColumns';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();

  return (
    <InteractiveObjectTable<LocaleData>
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
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Literacy,
          columnGroup: 'Writing',
        },
        {
          key: 'Writing System (specified)',
          description: (
            <>
              Some locales specify a writing system, for instance{' '}
              <code>
                zh_<strong>Hant</strong>_TW
              </code>{' '}
              means it specifically refers to Traditional Han characters.
            </>
          ),
          render: (object) => <HoverableObjectName object={object.writingSystem} />,
          isInitiallyVisible: false,
          columnGroup: 'Writing',
        },
        {
          key: 'Writing System (inferred)',
          description: (
            <>
              Some locales do not include a writing system but it can usually be inferred based on
              the primary writing system for the language. For instance, <code>zh_CN</code> could be
              written in <code>Hant</code> or <code>Hans</code> writing. Since the primary writing
              system in China is the Simplified character, it can be inferred to be{' '}
              <code>Hans</code>.
            </>
          ),
          render: (object) => (
            <HoverableObjectName
              object={object.writingSystem ?? object.language?.primaryWritingSystem}
            />
          ),
          isInitiallyVisible: false,
          columnGroup: 'Writing',
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
          valueType: TableValueType.Numeric,
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
          render: (object) => <ObjectWikipediaInfo object={object} />,
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
