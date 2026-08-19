import React, { useCallback } from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import Deemphasized from '@shared/ui/Deemphasized';

import { useDecoderDataContext } from './DecoderDataContext';

const DecoderTable: React.FC = () => {
  const { results } = useDecoderDataContext();

  // Export functionality
  const copyToClipboard = (text: string | string[]) =>
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('\n') : text);
  const copyResultingNames = useCallback(() => {
    copyToClipboard(results.map((r) => r?.lang?.nameDisplay ?? ''));
  }, [results]);
  const copyResultingCodes = useCallback(() => {
    copyToClipboard(results.map((r) => r?.lang?.codeDisplay ?? ''));
  }, [results]);

  return (
    <table className="h-fit">
      <thead>
        <tr>
          <th>Code</th>
          <th>LangNav Entry</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i}>
            <td>{r.lang?.codeDisplay}</td>
            <td>
              {r.lang ? (
                <HoverableObjectName object={r.lang} labelSource="name" />
              ) : (
                <Deemphasized>Not found</Deemphasized>
              )}
            </td>
          </tr>
        ))}
        <tr>
          <td>
            <button className="primary p-1! mr-1" onClick={copyResultingCodes}>
              Copy codes
            </button>
          </td>
          <td>
            <button className="primary p-1!" onClick={copyResultingNames}>
              Copy names
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default DecoderTable;
