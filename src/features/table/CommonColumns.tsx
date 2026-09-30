import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import { SearchableField } from '@features/params/PageParamTypes';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

import { EntityData } from '@entities/types/EntityTypes';

import PinButton from '@shared/ui/PinButton';

import TableColumn from './TableColumn';

export const NAME_COLUMN_MAX_WIDTH = '20em';

export const PinColumn: TableColumn<EntityData> = {
  key: 'Pin',
  label: '',
  render: (ent) => <PinButton className="bg-transparent!" ent={ent} />,
  exportValue: () => '',
};

export const CodeColumn: TableColumn<EntityData> = {
  key: 'ID',
  render: (ent) => <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.Code} />,
  field: Field.Code,
  columnGroup: 'Codes',
};

export const NameColumn: TableColumn<EntityData> = {
  key: 'Name',
  render: (ent) => (
    <HoverableEntity ent={ent} style={{ maxWidth: NAME_COLUMN_MAX_WIDTH }}>
      <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
    </HoverableEntity>
  ),
  exportValue: (ent) => ent.nameDisplay, // avoid html escapes like &amp;
  field: Field.Name,
  columnGroup: 'Names',
};

export const EndonymColumn: TableColumn<EntityData> = {
  key: 'Endonym',
  render: (ent) => (
    <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameEndonym} />
  ),
  field: Field.Endonym,
  isInitiallyVisible: false,
  columnGroup: 'Names',
};

export const getFieldColumn = (field: Field): TableColumn<EntityData> => ({
  key: field,
  render: (ent) => <EntityFieldDisplay ent={ent} field={field} />,
  field: field,
  isInitiallyVisible: false,
});
