import { TriangleAlertIcon } from 'lucide-react';
import { ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import { LanguageData, LanguageField, LanguageSource } from '@entities/language/LanguageTypes';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';

import Deemphasized from '@shared/ui/Deemphasized';

import LanguageCodeDescriptionBySource from '@strings/LanguageCodeDescriptionBySource';

const columns: TableColumn<LanguageData>[] = [
  {
    key: 'Code',
    field: Field.Code,
    description: <CodeDisplayDescription />,
    render: (lang: LanguageData): ReactNode => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.Code} />
        {<MaybeISOWarning lang={lang} />}
      </div>
    ),
    isInitiallyVisible: true,
  },
  {
    key: 'Canonical ID',
    description: <LanguageCodeDescriptionBySource languageSource={LanguageSource.Combined} />,
    render: (lang: LanguageData): ReactNode => lang.ID,
  },
  {
    key: 'ISO 639-1',
    description: 'The two-letter ISO 639-1 code, if one is assigned.',
    render: (lang) => (lang.ISO.code6391 ? lang.ISO.code6391 : <Deemphasized>—</Deemphasized>),
  },
  {
    key: 'ISO 639-3/5',
    description: <LanguageCodeDescriptionBySource languageSource={LanguageSource.ISO} />,
    render: (lang) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {lang.ISO.code}
        {<MaybeISOWarning lang={lang} />}
      </div>
    ),
  },
  {
    key: 'BCP Code',
    description: <LanguageCodeDescriptionBySource languageSource={LanguageSource.BCP} />,
    render: (lang) =>
      lang.BCP.code !== lang.ISO.code ? (
        lang.BCP.code
      ) : (
        <Deemphasized>{lang.BCP.code}</Deemphasized>
      ),
  },
  {
    key: 'CLDR Code',
    description: <LanguageCodeDescriptionBySource languageSource={LanguageSource.CLDR} />,
    render: (lang) =>
      lang.CLDR.code !== lang.ISO.code ? (
        <>
          {lang.CLDR.code}
          <CLDRWarningNotes object={lang} />
        </>
      ) : (
        <Deemphasized>{lang.CLDR.code}</Deemphasized>
      ),
  },
  {
    key: 'Glottocode',
    description: <LanguageCodeDescriptionBySource languageSource={LanguageSource.Glottolog} />,
    render: (lang) => lang.Glottolog.code,
  },
];

export const LanguageCodeColumns: TableColumn<LanguageData>[] = columns.map(
  (col: TableColumn<LanguageData>) => ({
    ...col,
    isInitiallyVisible: col.isInitiallyVisible ?? false,
    columnGroup: 'Codes',
  }),
);

function MaybeISOWarning({ lang }: { lang: LanguageData }): React.ReactNode | null {
  return lang.warnings && lang.warnings[LanguageField.isoCode] ? (
    <Hoverable
      hoverContent={<LanguageRetirementReason lang={lang} />}
      style={{ marginLeft: '0.125em' }}
    >
      <TriangleAlertIcon size="1em" display="block" color="var(--color-text-yellow)" />
    </Hoverable>
  ) : null;
}

function CodeDisplayDescription() {
  const { languageSource } = usePageParams();
  return (
    <>
      The short combination of alphabetic or alphanumeric characters to identify the language or
      languoid -- according to the {languageSource} language source:
      <div style={{ height: '0.5em' }} />
      <LanguageCodeDescriptionBySource languageSource={languageSource} />
    </>
  );
}
