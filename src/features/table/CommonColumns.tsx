import React, { useCallback } from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import { EntityData } from '@entities/types/DataTypes';

import PinButton from '@shared/ui/PinButton';

import TableColumn from './TableColumn';

const NAME_COLUMN_MAX_WIDTH = '20em';

const TablePinCell: React.FC<{ ent: EntityData }> = ({ ent }) => {
  const { pinned, updatePageParams } = usePageParams();
  const isPinned = pinned.includes(ent.ID);
  const togglePin = useCallback(() => {
    updatePageParams({
      pinned: isPinned ? pinned.filter((id) => id !== ent.ID) : [...pinned, ent.ID],
    });
  }, [isPinned, pinned, ent.ID, updatePageParams]);

  return <PinButton isPinned={isPinned} onTogglePin={togglePin} />;
};

export const PinColumn: TableColumn<EntityData> = {
  key: 'Pin',
  label: '',
  render: (ent) => <TablePinCell ent={ent} />,
  exportValue: () => '',
};

export const CodeColumn: TableColumn<EntityData> = {
  key: 'ID',
  render: (ent) => <ObjectFieldHighlightedByPageSearch ent={ent} field={SearchableField.Code} />,
  field: Field.Code,
  columnGroup: 'Codes',
};

export const NameColumn: TableColumn<EntityData> = {
  key: 'Name',
  render: (ent) => (
    <HoverableObject ent={ent} style={{ maxWidth: NAME_COLUMN_MAX_WIDTH }}>
      <ObjectFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
    </HoverableObject>
  ),
  exportValue: (ent) => ent.nameDisplay, // avoid html escapes like &amp;
  field: Field.Name,
  columnGroup: 'Names',
};

export const EndonymColumn: TableColumn<EntityData> = {
  key: 'Endonym',
  render: (ent) => (
    <ObjectFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameEndonym} />
  ),
  field: Field.Endonym,
  isInitiallyVisible: false,
  columnGroup: 'Names',
};
