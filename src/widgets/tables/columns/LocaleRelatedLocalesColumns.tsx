import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import TableColumn from '@features/table/TableColumn';

import { LocaleData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

const columns: TableColumn<LocaleData>[] = [
  {
    key: 'More General Locales',
    render: (object) => (
      <CommaSeparated limit={1} limitText="short">
        {object.relatedLocales?.moreGeneral?.map((locale) => (
          <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
  {
    key: 'More Specific Locales',
    render: (object) => (
      <CommaSeparated limit={1} limitText="short">
        {object.relatedLocales?.moreSpecific?.map((locale) => (
          <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
  {
    key: 'Parent Language Locale',
    render: (object) => (
      <HoverableObjectName object={object.relatedLocales?.parentLanguage} labelSource="code" />
    ),
  },
  {
    key: 'Child Language Locales',
    render: (object) => (
      <CommaSeparated limit={1} limitText="short">
        {object.relatedLocales?.childLanguages?.map((locale) => (
          <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
        ))}
      </CommaSeparated>
    ),
  },
  {
    key: 'Encapsulating Territory Locale',
    render: (object) => (
      <HoverableObjectName object={object.relatedLocales?.parentTerritory} labelSource="code" />
    ),
  },
  {
    key: 'Contained Territory Locales',
    render: (object) => (
      <CommaSeparated limit={1} limitText="short">
        {object.relatedLocales?.childTerritories?.map((locale) => (
          <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
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
