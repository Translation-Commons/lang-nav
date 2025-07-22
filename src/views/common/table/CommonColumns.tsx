import { InfoIcon } from 'lucide-react';

import { ObjectData } from '../../../types/DataTypes';
import { SearchableField, SortBy } from '../../../types/PageParamTypes';
import HoverableObject from '../HoverableObject';
import { ObjectFieldHighlightedByPageSearch } from '../ObjectField';

import { TableColumn } from './ObjectTable';

export const CodeColumn: TableColumn<ObjectData> = {
  key: 'ID',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />
  ),
  sortParam: SortBy.Code,
};

export const NameColumn: TableColumn<ObjectData> = {
  key: 'Name',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.EngName} />
  ),
  sortParam: SortBy.Name,
};

export const EndonymColumn: TableColumn<ObjectData> = {
  key: 'Endonym',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Endonym} />
  ),
  isInitiallyVisible: false,
};

export const InfoButtonColumn: TableColumn<ObjectData> = {
  key: 'Info',
  render: (object) => (
    <HoverableObject object={object}>
      <button className="InfoButton">
        <InfoIcon size="1em" display="block" style={{ verticalAlign: 'middle' }} />
      </button>
    </HoverableObject>
  ),
};
