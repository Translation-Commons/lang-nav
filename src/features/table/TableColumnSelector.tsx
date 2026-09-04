import { ArrowUpDownIcon, Columns3Icon } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { areArraysIdentical, groupBy } from '@shared/lib/setUtils';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { Checkbox } from '@shared/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@shared/ui/command';
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@shared/ui/drawer';

import TableColumn from './TableColumn';
import TableColumnPresets from './TableColumnPresets';
import { ColumnVisibilityModule } from './useColumnVisibility';

const columnPresetsToColumns: Record<string, string[]> = {
  Overview: [
    'ID',
    'Name',
    'Endonym',
    'Speakers (est.)',
    'Writers (est.)',
    'ISO Status',
    'Overall Digital Support',
    'Countries',
  ],
  'Language Codes': [
    'ID',
    'Canonical ID',
    'ISO 639-1',
    'ISO 639-3/5',
    'BCP Code',
    'CLDR Code',
    'Glottocode',
    'Name',
  ],
  Names: ['ID', 'Name', 'Endonym', 'ISO Name', 'CLDR Name', 'Glottolog Name', 'Other Names'],
  'Digital Support': [
    'ID',
    'Name',
    'Overall Digital Support',
    'Keyboards',
    'Machine Translation',
    'I18n Frameworks',
    'Interface Support',
    'Documentation',
  ],
};

function TableColumnSelector<T extends EntityData>({
  columns,
  visibilityModule,
}: {
  columns: TableColumn<T>[];
  visibilityModule: ColumnVisibilityModule<T>;
}): React.ReactNode {
  const { columnVisibility } = visibilityModule;
  const columnsByGroup = groupBy(columns, (column) => column.columnGroup || column.key);
  const nVisible = columns.filter((col) => columnVisibility[col.key]).length;

  const activePreset = useMemo(() => {
    console.log(
      Object.entries(columnVisibility)
        .filter(([, value]) => value)
        .map(([key]) => key),
    );
    const preset = Object.entries(columnPresetsToColumns).find(([, cols]) =>
      areArraysIdentical(
        cols,
        Object.entries(columnVisibility)
          .filter(([, value]) => value)
          .map(([key]) => key),
      ),
    );
    return preset ? preset[0] : 'custom';
  }, [columnVisibility]);
  const applyPreset = useCallback(
    (presetId: string | null) => {
      if (presetId === null) return;
      const columns = columnPresetsToColumns[presetId];
      if (columns) visibilityModule.setColumns(columns);
    },
    [visibilityModule],
  );
  const selectAll = useCallback(() => {
    visibilityModule.setColumns(columns.map((col) => col.key));
  }, [columns, visibilityModule]);
  const deselectAll = useCallback(() => {
    visibilityModule.setColumns([]);
  }, [visibilityModule]);

  return (
    <Drawer modal={false} swipeDirection="right">
      <DrawerTrigger
        render={
          <Button variant="outline">
            <Columns3Icon />
            Columns
            <Badge variant="secondary">{nVisible}</Badge>
          </Button>
        }
      />

      <DrawerContent className="w-60">
        <DrawerHeader className="text-lg font-bold">Column Selector</DrawerHeader>
        <TableColumnPresets columns={columns} visibilityModule={visibilityModule} />
        <Command>
          <CommandInput placeholder="Search columns..." />

          <CommandList className="max-h-160 overflow-y-auto">
            <CommandEmpty>No columns found.</CommandEmpty>

            {Object.entries(columnsByGroup).map(([group, columns]) => (
              <CommandGroup heading={group} key={group}>
                <ColumnGroup columns={columns} group={group} visibilityModule={visibilityModule} />
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DrawerContent>
    </Drawer>
  );
}

function ColumnGroup<T extends EntityData>({
  columns,
  visibilityModule: { columnVisibility, toggleColumn },
  group,
}: {
  columns: TableColumn<T>[];
  visibilityModule: ColumnVisibilityModule<T>;
  group: string;
}): React.ReactNode {
  const { sortBy, secondarySortBy } = usePageParams();

  return (
    <div key={group}>
      {columns.map((column) => (
        <CommandItem
          key={column.key}
          value={column.key + ' ' + group}
          onSelect={() => toggleColumn(column.key)}
          className="flex items-center gap-2 w-full"
        >
          <Checkbox
            checked={columnVisibility[column.key] || false}
            tabIndex={-1}
            aria-hidden="true"
          />

          <div>{column.label ?? column.key}</div>

          {sortBy === column.field || secondarySortBy === column.field ? (
            <ArrowUpDownIcon
              className="justify-self-end"
              style={{
                color: 'var(--color-button-primary)',
                opacity: secondarySortBy === column.field ? 0.5 : 1,
              }}
            />
          ) : null}
        </CommandItem>
      ))}
    </div>
  );
}

export default TableColumnSelector;
