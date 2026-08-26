import { CopyIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';

import EmptyHoverCardProvider from '@features/layers/hovercard/EmptyHoverCardProvider';
import { PageParamsContext } from '@features/params/PageParamsContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { prepareCLDRLocalePopulationForExport } from '@entities/locale/localstatus/LocaleCLDRExport';
import { EntityData } from '@entities/types/DataTypes';

import { trackEvent } from '@shared/lib/amplitude';
import { csvEscape, reactNodeToString } from '@shared/lib/stringExportUtils';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { Spinner } from '@shared/ui/spinner';

import { PinColumn } from './CommonColumns';
import TableColumn from './TableColumn';
import { prepareUNESCODataForExport } from './UNESCOExport';

interface Props<T> {
  visibleColumns: TableColumn<T>[];
  ents: T[];
}

enum ExportType {
  DownloadCSV = 'Download CSV',
  DownloadTSV = 'Download TSV',
  DownloadUNESCO = 'Download UNESCO TSV',
  CopyCSV = 'Copy CSV',
  CopyTSV = 'Copy TSV',
  CopyUNESCO = 'Copy UNESCO TSV',
  CopyCLDR = 'Copy CLDR TSV',
}

type DownloadExportType =
  | ExportType.DownloadCSV
  | ExportType.DownloadTSV
  | ExportType.DownloadUNESCO;
type CopyExportType =
  | ExportType.CopyCSV
  | ExportType.CopyTSV
  | ExportType.CopyUNESCO
  | ExportType.CopyCLDR;

function TableExport<T extends EntityData>({ visibleColumns, ents }: Props<T>) {
  const pageParams = usePageParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const prepareDataForExport = useCallback(
    (exportType: ExportType) => {
      const separator =
        exportType === ExportType.DownloadCSV || exportType === ExportType.CopyCSV ? ',' : '\t';
      if (exportType === ExportType.DownloadUNESCO || exportType === ExportType.CopyUNESCO) {
        return prepareUNESCODataForExport(ents, pageParams.territoryFilter);
      }
      if (exportType === ExportType.CopyCLDR) {
        return prepareCLDRLocalePopulationForExport(ents);
      }
      // The pin column is always present in the table for the UI, but it carries no data on its
      // own. Omit it entirely when nothing is pinned; otherwise export which rows are pinned.
      const exportColumns =
        pageParams.pinned.length > 0
          ? visibleColumns.map((c) =>
              c.key === PinColumn.key
                ? {
                    ...c,
                    exportValue: (ent: T) => (pageParams.pinned.includes(ent.ID) ? 'Pinned' : ''),
                  }
                : c,
            )
          : visibleColumns.filter((c) => c.key !== PinColumn.key);
      const header = exportColumns.map((c) => csvEscape(c.key)).join(separator);
      const rows = ents.map((ent) => {
        return exportColumns
          .map(({ exportValue, render }) => {
            if (exportValue) return exportValue(ent);
            return reactNodeToString(
              // Optimistically convert React nodes to text
              <PageParamsContext.Provider value={pageParams}>
                <EmptyHoverCardProvider>{render(ent)}</EmptyHoverCardProvider>
              </PageParamsContext.Provider>,
            );
          })
          .map(csvEscape)
          .join(separator);
      });
      return [header, ...rows].join('\n');
    },
    [ents, pageParams, visibleColumns],
  );

  const handleExportFile = useCallback(
    async (exportType: DownloadExportType) => {
      const data = prepareDataForExport(exportType);
      const filetype = exportType === ExportType.DownloadCSV ? 'csv' : 'tsv';
      const blob = new Blob([data], { type: `text/${filetype};charset=utf-8` });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `langnav-export-${ts}.${filetype}`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
    [prepareDataForExport],
  );

  const handleClipboardExport = useCallback(
    (exportType: CopyExportType) => {
      const data = prepareDataForExport(exportType);
      navigator.clipboard.writeText(data);
      alert('Data copied to clipboard');
    },
    [prepareDataForExport],
  );

  const handleExport = useCallback(
    (exportType: ExportType) => {
      setOpen(false);

      if (ents.length === 0) return;
      trackEvent('data_exported', {
        export_type: exportType,
        entType: pageParams.entType,
        view: pageParams.view,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        row_count: ents.length,
        column_count: visibleColumns.length,
      });
      startTransition(() => {
        switch (exportType) {
          case ExportType.DownloadCSV:
          case ExportType.DownloadTSV:
          case ExportType.DownloadUNESCO:
            handleExportFile(exportType);
            break;
          case ExportType.CopyCSV:
          case ExportType.CopyTSV:
          case ExportType.CopyUNESCO:
          case ExportType.CopyCLDR:
            handleClipboardExport(exportType);
            break;
        }
      });
    },
    [handleClipboardExport, handleExportFile, ents, visibleColumns.length],
  );
  let validExportTypes = Object.values(ExportType);
  if (pageParams.entType !== EntityType.Language && pageParams.entType !== EntityType.Locale) {
    validExportTypes = validExportTypes.filter(
      (et) =>
        et !== ExportType.DownloadUNESCO &&
        et !== ExportType.CopyUNESCO &&
        et !== ExportType.CopyCLDR,
    );
  } else if (pageParams.entType === EntityType.Language) {
    validExportTypes = validExportTypes.filter((et) => et !== ExportType.CopyCLDR);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button className="cursor-pointer">
            {isPending ? <Spinner /> : <ExternalLinkIcon />} Export
          </Button>
        }
      />
      <DropdownMenuContent className="w-fit">
        {validExportTypes.map((exportType) => (
          <DropdownMenuItem
            className="cursor-pointer"
            key={exportType}
            onClick={() => handleExport(exportType)}
          >
            {exportType.startsWith('Download') ? <DownloadIcon /> : <CopyIcon />} {exportType}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TableExport;
