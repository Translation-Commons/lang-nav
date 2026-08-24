import { CopyIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import EmptyHoverCardProvider from '@features/layers/hovercard/EmptyHoverCardProvider';
import { PageParamsContext } from '@features/params/PageParamsContext';
import { EntityType } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { prepareCLDRLocalePopulationForExport } from '@entities/locale/localstatus/LocaleCLDRExport';
import { EntityData } from '@entities/types/DataTypes';

import { trackEvent } from '@shared/lib/amplitude';
import { csvEscape, reactNodeToString } from '@shared/lib/stringExportUtils';
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
  Unchosen = 'Export',
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
  // Track when the user initiates an export; used to disable the button while processing
  const [isExporting, setIsExporting] = useState(false);
  const pageParams = usePageParams();

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
    async (exportType: CopyExportType) => {
      const data = prepareDataForExport(exportType);
      navigator.clipboard.writeText(data);
      alert('Data copied to clipboard');
    },
    [prepareDataForExport],
  );

  const handleExport = useCallback(
    (exportType: ExportType) => {
      if (ents.length === 0) return;
      setIsExporting(true);
      trackEvent('data_exported', {
        export_type: exportType,
        entType: pageParams.entType,
        view: pageParams.view,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        row_count: ents.length,
        column_count: visibleColumns.length,
      });
      void (async () => {
        try {
          switch (exportType) {
            case ExportType.DownloadCSV:
            case ExportType.DownloadTSV:
            case ExportType.DownloadUNESCO:
              await handleExportFile(exportType);
              break;
            case ExportType.CopyCSV:
            case ExportType.CopyTSV:
            case ExportType.CopyUNESCO:
            case ExportType.CopyCLDR:
              await handleClipboardExport(exportType);
              break;
          }
        } finally {
          setIsExporting(false);
        }
      })();
    },
    [handleClipboardExport, handleExportFile, ents, visibleColumns.length],
  );
  let validExportTypes = Object.values(ExportType).filter((et) => et !== ExportType.Unchosen);
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
    <Selector
      options={validExportTypes}
      onChange={handleExport}
      selected={ExportType.Unchosen}
      getOptionLabel={(exportType: ExportType) => (
        <ExportLabel exportType={exportType} isExporting={isExporting} />
      )}
      getOptionDescription={getExportDescription}
    />
  );
}

const ExportLabel: React.FC<{ exportType: ExportType; isExporting: boolean }> = ({
  exportType,
  isExporting,
}) => {
  switch (exportType) {
    case ExportType.DownloadCSV:
    case ExportType.DownloadTSV:
    case ExportType.DownloadUNESCO:
      return (
        <div style={{ display: 'flex' }}>
          <DownloadIcon className="button-inline-icon" /> {exportType}
        </div>
      );
    case ExportType.CopyCSV:
    case ExportType.CopyTSV:
    case ExportType.CopyUNESCO:
    case ExportType.CopyCLDR:
      return (
        <div style={{ display: 'flex' }}>
          <CopyIcon className="button-inline-icon" /> {exportType}
        </div>
      );
    case ExportType.Unchosen:
      return (
        <div style={{ display: 'flex' }}>
          {isExporting ? (
            <Spinner className="button-inline-icon" />
          ) : (
            <ExternalLinkIcon className="button-inline-icon" />
          )}{' '}
          {exportType}
        </div>
      );
  }
};

function getExportDescription(exportType: ExportType) {
  switch (exportType) {
    case ExportType.DownloadCSV:
      return 'Export visible rows & columns to comma-separated values (CSV) file';
    case ExportType.DownloadTSV:
      return 'Export visible rows & columns to tab-separated values (TSV) file';
    case ExportType.CopyCSV:
      return 'Copy visible rows & columns to clipboard as comma-separated values (CSV)';
    case ExportType.CopyTSV:
      return 'Copy visible rows & columns to clipboard as tab-separated values (TSV)';
    case ExportType.DownloadUNESCO:
      return 'Export data prepared for UNESCO in a TSV file format.';
    case ExportType.CopyUNESCO:
      return 'Copy data prepared for UNESCO in TSV format to clipboard.';
    case ExportType.CopyCLDR:
      return "Copy data prepared for CLDR's country_language_population.tsv to clipboard.";
    case ExportType.Unchosen:
      return 'Export data: selected columns and filtered rows to CSV or TSV';
  }
}

export default TableExport;
