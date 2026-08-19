import React, { useCallback } from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { useDecoderDataContext } from './DecoderDataContext';
import { getDecoderMacroCode } from './DecoderMacrolanguage';
import { useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderTable: React.FC = () => {
  const { includeMacroCodes } = useDecoderOptionsContext();
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
          <th>Alternatives</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => {
          const { codeWithMacro } = includeMacroCodes
            ? (getDecoderMacroCode(r.lang, r.lang?.codeDisplay) ?? {})
            : {};

          return (
            <tr key={i}>
              <td>{codeWithMacro ?? r.lang?.codeDisplay ?? r.input}</td>
              <td>
                {r.lang ? (
                  <HoverableObjectName object={r.lang} />
                ) : (
                  <Deemphasized>Not found</Deemphasized>
                )}
              </td>
              <td>
                <CommaSeparated>
                  {r.alts?.map((alt) => (
                    <HoverableObjectName object={alt} key={alt.ID} />
                  ))}
                </CommaSeparated>
              </td>
            </tr>
          );
        })}
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
