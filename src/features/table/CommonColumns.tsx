import { ObjectData } from '@entities/types/DataTypes';
import HoverableObject from '@entities/ui/HoverableObject';
import { ObjectFieldHighlightedByPageSearch } from '@entities/ui/ObjectField';
import { SortBy } from '@features/sorting/SortTypes';
import { SearchableField } from '@widgets/PageParamTypes';

import { TableColumn } from './ObjectTable';

const NAME_COLUMN_MAX_WIDTH = '20em';

export const CodeColumn: TableColumn<ObjectData> = {
  key: 'ID',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />
  ),
  sortParam: SortBy.Code,
  columnGroup: 'Codes',
};

export const NameColumn: TableColumn<ObjectData> = {
  key: 'Name',
  render: (object) => (
    <HoverableObject object={object} style={{ maxWidth: NAME_COLUMN_MAX_WIDTH }}>
      <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.EngName} />
    </HoverableObject>
  ),
  sortParam: SortBy.Name,
  columnGroup: 'Names',
};

export const EndonymColumn: TableColumn<ObjectData> = {
  key: 'Endonym',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Endonym} />
  ),
  sortParam: SortBy.Endonym,
  isInitiallyVisible: false,
  columnGroup: 'Names',
};
