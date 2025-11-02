import { EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';

import { LanguageData } from '@entities/language/LanguageTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

export const LanguageNameColumns: TableColumn<LanguageData>[] = [
  NameColumn,
  { ...EndonymColumn, isInitiallyVisible: true },
  {
    key: 'ISO Name',
    render: (lang) =>
      lang.nameDisplay !== lang.sourceSpecific.ISO.name ? (
        lang.sourceSpecific.ISO.name
      ) : (
        <Deemphasized>{lang.sourceSpecific.ISO.name}</Deemphasized>
      ),
    description: (
      <>
        The name of the language as listed in the ISO 639-3 standard. Italicized names match the
        primary name and are thereby deemphasized.{' '}
        <LinkButton href="https://iso639-3.sil.org/code_tables/639/data">More info</LinkButton>
      </>
    ),
    isInitiallyVisible: false,
    columnGroup: 'Names',
  },
  {
    key: 'CLDR Name',
    render: (lang) =>
      lang.nameDisplay !== lang.sourceSpecific.CLDR.name ? (
        lang.sourceSpecific.CLDR.name
      ) : (
        <Deemphasized>{lang.sourceSpecific.CLDR.name}</Deemphasized>
      ),
    isInitiallyVisible: false,
    columnGroup: 'Names',
  },
  {
    key: 'Glottolog Name',
    render: (lang) =>
      lang.nameDisplay !== lang.sourceSpecific.Glottolog.name ? (
        lang.sourceSpecific.Glottolog.name
      ) : (
        <Deemphasized>{lang.sourceSpecific.Glottolog.name}</Deemphasized>
      ),
    isInitiallyVisible: false,
    columnGroup: 'Names',
  },
  {
    key: 'Other Names',
    render: (lang) => {
      const { Glottolog, ISO, CLDR } = lang.sourceSpecific;
      const otherNames = lang.names.filter(
        (name) =>
          ![lang.nameDisplay, lang.nameEndonym, Glottolog.name, ISO.name, CLDR.name].includes(name),
      );
      return otherNames.length > 0 && otherNames.join(', ');
    },
    isInitiallyVisible: false,
    columnGroup: 'Names',
  },
];
