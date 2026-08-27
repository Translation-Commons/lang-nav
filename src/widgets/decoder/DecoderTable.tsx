import React, { useCallback } from 'react';

import { Button } from '@shared/ui/button';

import { useDecoderDataContext } from './DecoderDataContext';
import DecoderRow from './DecoderRow';
import { useDecoderOptionsContext } from './options/DecoderOptionsContext';

const DecoderTable: React.FC = () => {
  const { inputLines, getResult } = useDecoderDataContext();
  const { includeMacroCodes } = useDecoderOptionsContext();

  // Export functionality
  const copyToClipboard = (text: string | string[]) =>
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('\n') : text);
  const copyResultingNames = useCallback(() => {
    copyToClipboard(inputLines.map((l) => getResult(l)?.lang?.nameDisplay ?? ''));
  }, [inputLines, getResult]);
  const copyResultingCodes = useCallback(() => {
    copyToClipboard(
      inputLines.map((l) => {
        const result = getResult(l);
        const code = result?.lang?.codeDisplay ?? '';
        if (includeMacroCodes) return result?.codeWithMacro ?? code;
        return code;
      }),
    );
  }, [inputLines, getResult, includeMacroCodes]);

  return (
    <table className="h-fit">
      <thead>
        <tr className="leading-[30px]">
          <th className="min-w-30">Best Match</th>
          <th>Alternatives</th>
        </tr>
      </thead>
      <tbody>
        {inputLines.map((l, i) => (
          <DecoderRow key={i} input={l} />
        ))}
        <tr>
          <td colSpan={2}>
            <Button className="cursor-pointer" onClick={copyResultingCodes}>
              Copy codes
            </Button>
            <Button className="cursor-pointer" onClick={copyResultingNames}>
              Copy names
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default DecoderTable;
