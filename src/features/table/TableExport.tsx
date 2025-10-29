import { CopyIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import Selector from '@widgets/controls/components/Selector';
import { SelectorDisplay } from '@widgets/controls/components/SelectorDisplay';

import EmptyHoverCardProvider from '@features/hovercard/EmptyHoverCardProvider';
import { PageParamsContext } from '@features/page-params/PageParamsContext';
import usePageParams from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { csvEscape, reactNodeToString } from '@shared/lib/stringExportUtils';
import LoadingIcon from '@shared/ui/LoadingIcon';

import TableColumn from './TableColumn';

interface Props<T> {
  visibleColumns: TableColumn<T>[];
  objectsFilteredAndSorted: T[];
}

enum ExportType {
  DownloadCSV = 'Download CSV',
  DownloadTSV = 'Download TSV',
  CopyCSV = 'Copy CSV',
  CopyTSV = 'Copy TSV',
  Unchosen = 'Export',
}

function TableExport<T extends ObjectData>({ visibleColumns, objectsFilteredAndSorted }: Props<T>) {
  // Track when the user initiates an export; used to disable the button while processing
  const [isExporting, setIsExporting] = useState(false);
  const pageParams = usePageParams();

  const prepareDataForExport = useCallback(
    (separator: ',' | '\t') => {
      const header = visibleColumns.map((c) => csvEscape(c.key)).join(separator);
      const rows = objectsFilteredAndSorted.map((obj) => {
        return visibleColumns
          .map(({ exportValue, render }) => {
            if (exportValue) return exportValue(obj);
            return reactNodeToString(
              // Optimistically convert React nodes to text
              <PageParamsContext.Provider value={pageParams}>
                <EmptyHoverCardProvider>{render(obj)}</EmptyHoverCardProvider>
              </PageParamsContext.Provider>,
            );
          })
          .map(csvEscape)
          .join(separator);
      });
      return [header, ...rows].join('\n');
    },
    [objectsFilteredAndSorted, pageParams, visibleColumns],
  );

  const handleExportFile = useCallback(
    async (separator: ',' | '\t') => {
      const data = prepareDataForExport(separator);
      const filetype = separator === ',' ? 'csv' : 'tsv';
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
    async (separator: ',' | '\t' = ',') => {
      const data = prepareDataForExport(separator);
      navigator.clipboard.writeText(data);
    },
    [prepareDataForExport],
  );

  const handleExport = useCallback(
    (exportType: ExportType) => {
      if (objectsFilteredAndSorted.length === 0) return;
      setIsExporting(true);
      void (async () => {
        try {
          switch (exportType) {
            case ExportType.DownloadCSV:
              await handleExportFile(',');
              break;
            case ExportType.DownloadTSV:
              await handleExportFile('\t');
              break;
            case ExportType.CopyCSV:
              await handleClipboardExport(',');
              break;
            case ExportType.CopyTSV:
              await handleClipboardExport('\t');
              break;
          }
        } finally {
          setIsExporting(false);
        }
      })();
    },
    [handleClipboardExport, handleExportFile, objectsFilteredAndSorted.length],
  );

  return (
    <Selector
      display={SelectorDisplay.Dropdown}
      options={Object.values(ExportType).filter((et) => et !== ExportType.Unchosen)}
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
      return (
        <>
          <DownloadIcon className="button-inline-icon" /> {exportType}
        </>
      );
    case ExportType.CopyCSV:
    case ExportType.CopyTSV:
      return (
        <>
          <CopyIcon className="button-inline-icon" /> {exportType}
        </>
      );
    case ExportType.Unchosen:
      return (
        <>
          {isExporting ? <LoadingIcon /> : <ExternalLinkIcon className="button-inline-icon" />}{' '}
          {exportType}
        </>
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
    case ExportType.Unchosen:
      return 'Export data: selected columns and filtered rows) to CSV or TSV';
  }
}

export default TableExport;
