import React, { useCallback } from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { ObjectData } from '@entities/types/DataTypes';

import PinButton from '@shared/ui/old/PinButton';

import TableColumn from './TableColumn';

const TablePinCell: React.FC<{ object: ObjectData }> = ({ object }) => {
  const { pinned, updatePageParams } = usePageParams();
  const isPinned = pinned.includes(object.ID);
  const togglePin = useCallback(() => {
    updatePageParams({
      pinned: isPinned ? pinned.filter((id) => id !== object.ID) : [...pinned, object.ID],
    });
  }, [isPinned, pinned, object.ID, updatePageParams]);

  return (
    <PinButton
      className={isPinned ? '' : 'invisible group-hover:visible'}
      isPinned={isPinned}
      onTogglePin={togglePin}
    />
  );
};

export const PinColumn: TableColumn<ObjectData> = {
  key: 'Pin',
  label: '',
  render: (object) => <TablePinCell object={object} />,
  exportValue: () => '',
};

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
    <HoverableObject object={object} className="max-w-[20em]">
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
