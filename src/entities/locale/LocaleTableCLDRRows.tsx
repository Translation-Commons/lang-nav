import { getCldrLocale } from '@features/data-loading/cldrLocales';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';

import { LocaleData } from '@entities/types/DataTypes';

// ------- CLDR columns (hidden by default) -------
const LocaleTableCLDRRows: TableColumn<LocaleData>[] = [
  {
    key: 'CLDR Tier',
    label: 'CLDR Tier',
    render: (loc: LocaleData) => {
      const cldr = getCldrLocale(loc.ID);
      return cldr ? cldr.tier : null;
    },
    isInitiallyVisible: false,
  },
  {
    key: 'CLDR Level',
    label: 'CLDR Level',
    render: (loc: LocaleData) => {
      const cldr = getCldrLocale(loc.ID);
      return cldr ? (
        <span>
          {cldr.targetLevel ?? '—'} / {cldr.computedLevel ?? '—'}
        </span>
      ) : null;
    },
    isInitiallyVisible: false,
  },
  {
    key: 'CLDR Confirmed %',
    label: 'Confirmed %',
    render: (loc: LocaleData) => {
      const cldr = getCldrLocale(loc.ID);
      return cldr?.confirmedPct != null ? cldr.confirmedPct : null;
    },
    isInitiallyVisible: false,
    valueType: TableValueType.Numeric,
  },
  {
    key: 'CLDR ICU',
    label: 'ICU',
    render: (loc: LocaleData) => {
      const cldr = getCldrLocale(loc.ID);
      return cldr?.icuIncluded ? '✓' : '—';
    },
    isInitiallyVisible: false,
  },
  {
    key: 'CLDR Default',
    label: 'Default Locale',
    render: (loc: LocaleData) => {
      const cldr = getCldrLocale(loc.ID);
      return cldr?.localeIsDefaultForLanguage ? '★' : '—';
    },
    isInitiallyVisible: false,
  },
];

export default LocaleTableCLDRRows;
