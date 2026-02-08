import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { SearchableField } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

import TableColumn from './TableColumn';

const NAME_COLUMN_MAX_WIDTH = '20em';

export const CodeColumn: TableColumn<ObjectData> = {
  key: 'ID',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />
  ),
  field: Field.Code,
  columnGroup: 'Codes',
};

export const NameColumn: TableColumn<ObjectData> = {
  key: 'Name',
  render: (object) => (
    <HoverableObject object={object} style={{ maxWidth: NAME_COLUMN_MAX_WIDTH }}>
      <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameDisplay} />
    </HoverableObject>
  ),
  exportValue: (object) => object.nameDisplay, // avoid html escapes like &amp;
  field: Field.Name,
  columnGroup: 'Names',
};

export const EndonymColumn: TableColumn<ObjectData> = {
  key: 'Endonym',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.NameEndonym} />
  ),
  field: Field.Endonym,
  isInitiallyVisible: false,
  columnGroup: 'Names',
};
