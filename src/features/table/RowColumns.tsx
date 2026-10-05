import { BaseRow } from '@features/data/api/list/tableContract';
import HoverableEntityRef from '@features/layers/hovercard/HoverableEntityRef';
import { SearchableField } from '@features/params/PageParamTypes';
import { TextHighlightedByPageSearch } from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import PinButton from '@shared/ui/PinButton';

import {
  CodeColumn,
  EndonymColumn,
  NAME_COLUMN_MAX_WIDTH,
  NameColumn,
  PinColumn,
} from './CommonColumns';
import TableColumn from './TableColumn';

// Row versions of CommonColumns, for tables that render endpoint rows instead of graph entities.

export const PinRowColumn: TableColumn<BaseRow> = {
  ...PinColumn,
  render: (row) => <PinButton className="bg-transparent!" ent={{ ID: row.id }} />,
  exportValue: () => '',
};

export const CodeRowColumn: TableColumn<BaseRow> = {
  ...CodeColumn,
  render: (row) => <TextHighlightedByPageSearch text={row.code} field={SearchableField.Code} />,
  exportValue: (row) => row.code,
};

export const NameRowColumn: TableColumn<BaseRow> = {
  ...NameColumn,
  render: (row) => (
    <HoverableEntityRef entRef={row} style={{ maxWidth: NAME_COLUMN_MAX_WIDTH }}>
      <TextHighlightedByPageSearch text={row.name} field={SearchableField.NameDisplay} />
    </HoverableEntityRef>
  ),
  exportValue: (row) => row.name,
};

export const EndonymRowColumn: TableColumn<BaseRow> = {
  ...EndonymColumn,
  render: (row) => (
    <TextHighlightedByPageSearch
      text={row.endonym ?? ''}
      field={SearchableField.NameEndonym}
      fallback={row.name}
    />
  ),
  exportValue: (row) => row.endonym ?? '',
};
