import { SearchableField } from '@features/params/PageParamTypes';
import { EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import LanguageOtherNames from '@entities/language/LanguageOtherNames';
import { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const LanguageNameColumns: TableColumn<LanguageData>[] = [
  { ...NameColumn, isInitiallyVisible: true },
  { ...EndonymColumn, isInitiallyVisible: true },
  {
    key: 'ISO Name',
    labelInColumnGroup: 'in ISO',
    render: (lang) =>
      lang.nameDisplay !== lang.ISO.name ? (
        <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameISO} />
      ) : (
        <Deemphasized>{lang.ISO.name}</Deemphasized>
      ),
    description: (
      <>
        The name of the language as listed in the ISO 639-3 standard. Italicized names match the
        primary name and are thereby deemphasized.{' '}
        <LinkButton href="https://iso639-3.sil.org/code_tables/639/data">More info</LinkButton>
      </>
    ),
  },
  {
    key: 'CLDR Name',
    labelInColumnGroup: 'in CLDR',
    render: (lang) =>
      lang.nameDisplay !== lang.CLDR.name ? (
        <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameCLDR} />
      ) : (
        <Deemphasized>{lang.CLDR.name}</Deemphasized>
      ),
  },
  {
    key: 'Glottolog Name',
    labelInColumnGroup: 'in Glottolog',
    render: (lang) =>
      lang.nameDisplay !== lang.Glottolog.name ? (
        <EntityFieldHighlightedByPageSearch ent={lang} field={SearchableField.NameGlottolog} />
      ) : (
        <Deemphasized>{lang.Glottolog.name}</Deemphasized>
      ),
  },
  {
    key: 'Other Names',
    render: (lang) => <LanguageOtherNames lang={lang} />,
  },
];

export default LanguageNameColumns.map((col) => ({
  ...col,
  isInitiallyVisible: col.isInitiallyVisible ?? false,
  columnGroup: 'Names',
}));
