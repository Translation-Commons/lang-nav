import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import TableColumn from '@features/table/TableColumn';

import { LocaleData } from '@entities/locale/LocaleTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

const columns: TableColumn<LocaleData>[] = [
  {
    key: 'More General Locales',
    render: (ent) => (
      <CommaSeparated limit={1} limitText="short">
        {ent.relatedLocales?.moreGeneral?.map((locale) => (
          <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
  {
    key: 'More Specific Locales',
    render: (ent) => (
      <CommaSeparated limit={1} limitText="short">
        {ent.relatedLocales?.moreSpecific?.map((locale) => (
          <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
  {
    key: 'Parent Language Locale',
    render: (ent) => (
      <HoverableObjectName ent={ent.relatedLocales?.parentLanguage} labelSource="code" />
    ),
  },
  {
    key: 'Child Language Locales',
    render: (ent) => (
      <CommaSeparated limit={1} limitText="short">
        {ent.relatedLocales?.childLanguages?.map((locale) => (
          <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
  {
    key: 'Encapsulating Territory Locale',
    render: (ent) => (
      <HoverableObjectName ent={ent.relatedLocales?.parentTerritory} labelSource="code" />
    ),
  },
  {
    key: 'Contained Territory Locales',
    render: (ent) => (
      <CommaSeparated limit={1} limitText="short">
        {ent.relatedLocales?.childTerritories?.map((locale) => (
          <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
];

export default columns.map((col) => ({
  ...col,
  isInitiallyVisible: false,
  columnGroup: 'Related Locales',
}));
