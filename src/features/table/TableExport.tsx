import { CopyIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

import EmptyHoverCardProvider from '@features/hovercard/EmptyHoverCardProvider';
import HoverableButton from '@features/hovercard/HoverableButton';
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

  /**
   * Build a CSV from the currently visible columns and the filtered+sorted objects
   * and trigger a download in the browser.
   */
  const handleExportFile = useCallback(
    (separator: ',' | '\t') => {
      if (objectsFilteredAndSorted.length === 0) return;
      setIsExporting(true);
      try {
        const data = prepareDataForExport(separator);
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
        const ts = new Date().toISOString().replace(/[:.]/g, '-');

        const filename = `langnav-export-${ts}.${separator === ',' ? `csv` : `tsv`}`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } finally {
        setIsExporting(false);
      }
    },
    [objectsFilteredAndSorted, prepareDataForExport, pageParams],
  );

  const handleClipboardExport = useCallback(
    (separator: ',' | '\t' = ',') => {
      if (objectsFilteredAndSorted.length === 0) return;
      setIsExporting(true);
      try {
        const data = prepareDataForExport(separator);
        navigator.clipboard.writeText(data);
      } finally {
        setIsExporting(false);
      }
    },
    [objectsFilteredAndSorted, prepareDataForExport, pageParams],
  );

  return (
    <HoverableButton
      hoverContent={
        <>
          <button
            type="button"
            onClick={() => handleExportFile(',')}
            disabled={isExporting || objectsFilteredAndSorted.length === 0}
            title="Export visible rows & columns to comma-separated values (CSV) file"
            style={{ cursor: isExporting ? 'default' : 'pointer' }}
          >
            {isExporting ? <LoadingIcon /> : <DownloadIcon className="button-inline-icon" />}
            {isExporting ? 'Preparing download…' : 'Download CSV'}
          </button>
          <button
            type="button"
            onClick={() => handleExportFile('\t')}
            disabled={isExporting || objectsFilteredAndSorted.length === 0}
            title="Export visible rows & columns to tab-separated values (TSV) file"
            style={{ cursor: isExporting ? 'default' : 'pointer' }}
          >
            {isExporting ? <LoadingIcon /> : <DownloadIcon className="button-inline-icon" />}
            {isExporting ? 'Preparing download…' : 'Download TSV'}
          </button>
          <button
            type="button"
            onClick={() => handleClipboardExport(',')}
            disabled={isExporting || objectsFilteredAndSorted.length === 0}
            title="Copy visible rows & columns to clipboard as comma-separated values (CSV)"
            style={{ cursor: isExporting ? 'default' : 'pointer' }}
          >
            {isExporting ? <LoadingIcon /> : <CopyIcon className="button-inline-icon" />}
            Copy CSV
          </button>
          <button
            type="button"
            onClick={() => handleClipboardExport('\t')}
            disabled={isExporting || objectsFilteredAndSorted.length === 0}
            title="Copy visible rows & columns to clipboard as tab-separated values (TSV)"
            style={{ cursor: isExporting ? 'default' : 'pointer' }}
          >
            {isExporting ? <LoadingIcon /> : <CopyIcon className="button-inline-icon" />}
            Copy TSV
          </button>
        </>
      }
    >
      <ExternalLinkIcon className="button-inline-icon" />
      Export
    </HoverableButton>
  );
}

export default TableExport;
