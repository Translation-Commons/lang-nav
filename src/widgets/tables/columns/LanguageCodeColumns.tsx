import { TriangleAlertIcon } from 'lucide-react';
import { ReactNode } from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import { SearchableField } from '@features/params/PageParamTypes';
import TableColumn from '@features/table/TableColumn';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import LanguageRetirementReason from '@entities/language/LanguageRetirementReason';
import { LanguageData, LanguageField } from '@entities/language/LanguageTypes';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import { ObjectFieldHighlightedByPageSearch } from '@entities/ui/ObjectField';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const columns: TableColumn<LanguageData>[] = [
  {
    key: 'ID',
    sortParam: SortBy.Code,
    description: (
      <>
        The canonical language code used throughout this application. Generally if there is an ISO
        639-3 or ISO 639-5 code assigned to the language, that is used. Most other language families
        and dialects without an ISO code have a Glottocode. Some entries may have a custom code from
        other source, but the entry may be contentious.
      </>
    ),
    render: (lang: LanguageData): ReactNode => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.Code} />
        {<MaybeISOWarning lang={lang} />}
      </div>
    ),
    isInitiallyVisible: true,
  },
  {
    key: 'ISO 639-1',
    render: (lang) => (lang.ISO.code6391 ? lang.ISO.code6391 : <Deemphasized>—</Deemphasized>),
  },
  {
    key: 'ISO 639-3/5',
    description: (
      <>
        The primary 3-letter code used by most systems.
        <LinkButton href="https://iso639-3.sil.org/">ISO 639-3 standard</LinkButton>
        <LinkButton href="https://www.loc.gov/standards/iso639-5/">ISO 639-5 standard</LinkButton>
      </>
    ),
    render: (lang) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {lang.ISO.code}
        {<MaybeISOWarning lang={lang} />}
      </div>
    ),
  },
  {
    key: 'BCP Code',
    description: (
      <>
        BCP 47 language tag as used in IETF standards. Usually this is the same as the ISO 639-3
        code but if there is a 2-letter code defined in ISO 639-1, that is used instead.
      </>
    ),
    render: (lang) =>
      lang.BCP.code !== lang.ISO.code ? (
        lang.BCP.code
      ) : (
        <Deemphasized>{lang.BCP.code}</Deemphasized>
      ),
  },
  {
    key: 'CLDR Code',
    description: (
      <>
        The CLDR language code as used in the Unicode Common Locale Data Repository (CLDR). This is
        usually the BCP code, but macrolanguages are handled differently. The primary language
        within a macrolanguage is assigned the code instead. So Chinese <code>zh</code> is used for
        Mandarin <code>cmn</code> and Malayic <code>ms</code> is used for Standard Malay{' '}
        <code>zsm</code>.
        <LinkButton href="https://www.unicode.org/cldr/charts/latest/supplemental/locale_coverage.html">
          CLDR project page
        </LinkButton>
      </>
    ),
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
