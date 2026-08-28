import React, { useCallback } from 'react';

import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import { SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';

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

  return <PinButton className="bg-transparent!" isPinned={isPinned} onTogglePin={togglePin} />;
};

export const PinColumn: TableColumn<EntityData> = {
  key: 'Pin',
  label: '',
  render: (ent) => <TablePinCell ent={ent} />,
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
