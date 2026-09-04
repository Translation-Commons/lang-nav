import React, { useCallback, useMemo } from 'react';

import { LanguageColumnPresets } from '@widgets/tables/columns/LanguageColumns';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { Button } from '@shared/ui/button';

import TableColumn from './TableColumn';
import { ColumnVisibilityModule } from './useColumnVisibility';

function TableColumnPresets<T extends EntityData>({
  columns,
  visibilityModule,
}: {
  columns: TableColumn<T>[];
  visibilityModule: ColumnVisibilityModule<T>;
}): React.ReactNode {
  const { entType } = usePageParams();
  const { setColumns, resetColumnVisibility } = visibilityModule;
  const columnPresets = useMemo(
    () => (entType === EntityType.Language ? LanguageColumnPresets : {}),
    [entType],
  );

  const applyPreset = useCallback(
    (presetId: string | null) => {
      if (presetId === null) return;
      const columns = columnPresets[presetId];
      if (columns) setColumns(columns);
    },
    [setColumns],
  );
  const selectAll = useCallback(() => {
    setColumns(columns.map((col) => col.key));
  }, [columns, setColumns]);
  const deselectAll = useCallback(() => {
    setColumns([]);
  }, [setColumns]);

  return (
    <div className="p-2">
      <div className="px-2 mt-1 mb-2 text-muted-foreground" style={{ fontWeight: '500' }}>
        Column Presets
      </div>
      <div className="gap-0 grid grid-cols-2">
        <Button onClick={selectAll} variant="ghost">
          Show all
        </Button>
        <Button onClick={deselectAll} variant="ghost">
          Hide all
        </Button>
        <Button onClick={resetColumnVisibility} variant="ghost">
          Default
        </Button>
        {Object.keys(columnPresets).map((preset) => (
          <Button key={preset} variant="ghost" onClick={() => applyPreset(preset)}>
            {preset}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default TableColumnPresets;
