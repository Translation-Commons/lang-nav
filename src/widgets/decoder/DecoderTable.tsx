import React, { useCallback } from 'react';

import CopyButton from '@shared/ui/CopyButton';

import { useDecoderDataContext } from './DecoderDataContext';
import DecoderRow from './DecoderRow';
import { useDecoderOptionsContext } from './options/DecoderOptionsContext';

const DecoderTable: React.FC = () => {
  const { inputLines, getResult } = useDecoderDataContext();
  const { includeMacroCodes } = useDecoderOptionsContext();

  // Export functionality
  const getResultingNames = useCallback(
    () => inputLines.map((l) => getResult(l)?.lang?.nameDisplay ?? '').join('\n'),
    [inputLines, getResult],
  );
  const getResultingCodes = useCallback(
    () =>
      inputLines
        .map((l) => {
          const result = getResult(l);
          const code = result?.lang?.codeDisplay ?? '';
          if (includeMacroCodes) return result?.codeWithMacro ?? code;
          return code;
        })
        .join('\n'),
    [inputLines, getResult, includeMacroCodes],
  );

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
            <CopyButton getTextToCopy={getResultingCodes}>Copy codes</CopyButton>
            <CopyButton getTextToCopy={getResultingNames}>Copy names</CopyButton>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default DecoderTable;
