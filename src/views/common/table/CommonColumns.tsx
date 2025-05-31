import { ObjectData } from '../../../types/DataTypes';
import { SearchableField, SortBy } from '../../../types/PageParamTypes';
import HoverableObject from '../HoverableObject';
import { ObjectFieldHighlightedByPageSearch } from '../ObjectField';

import { TableColumn } from './ObjectTable';

export const CodeColumn: TableColumn<ObjectData> = {
  label: 'ID',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.Code} />
  ),
  sortParam: SortBy.Code,
};

export const NameColumn: TableColumn<ObjectData> = {
  label: 'Name',
  render: (object) => (
    <ObjectFieldHighlightedByPageSearch object={object} field={SearchableField.EngName} />
  ),
  sortParam: SortBy.Name,
};

export const InfoButtonColumn: TableColumn<ObjectData> = {
  label: 'Info',
  render: (object) => (
    <HoverableObject object={object}>
      <button className="InfoButton">&#x24D8;</button>
    </HoverableObject>
  ),
};
