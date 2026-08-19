import { TriangleAlertIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { SearchableField } from '@features/params/PageParamTypes';
import HighlightedObjectField from '@features/transforms/search/HighlightedObjectField';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LoadingIcon from '@shared/ui/LoadingIcon';

import { useDecoderDataContext } from './DecoderDataContext';
import { useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderTable: React.FC = () => {
  const { inputLines, results } = useDecoderDataContext();

  // Export functionality
  const copyToClipboard = (text: string | string[]) =>
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('\n') : text);
  const copyResultingNames = useCallback(() => {
    copyToClipboard(inputLines.map((l) => results[l]?.lang?.nameDisplay ?? ''));
  }, [results]);
  const copyResultingCodes = useCallback(() => {
    copyToClipboard(inputLines.map((l) => results[l]?.lang?.codeDisplay ?? ''));
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
        {inputLines.map((l, i) => (
          <ResultRow key={i} input={l} />
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

const ResultRow: React.FC<{ input: string }> = ({ input }) => {
  const { includeMacroCodes } = useDecoderOptionsContext();
  const { results, isSearchActive } = useDecoderDataContext();
  const { lang, codeWithMacro, alts } = results[input.toLowerCase().trim()] ?? {};

  return (
    <tr>
      <td>{(includeMacroCodes ? codeWithMacro : undefined) ?? lang?.codeDisplay ?? input}</td>
      <td className="relative">
        {isSearchActive && (
          <div className="absolute right-0 top-0 mr-1 mt-1">
            <LoadingIcon />
          </div>
        )}
        {lang ? (
          <HoverableObject object={lang}>
            <HighlightedObjectField
              object={lang}
              query={input}
              field={SearchableField.NameAny}
              showOriginalName={true}
            />
          </HoverableObject>
        ) : (
          <Deemphasized>
            <div className="flex items-center gap-1">
              <TriangleAlertIcon display="inline-block" />
              <span className="font-bold">{input}</span> not found
            </div>
          </Deemphasized>
        )}
      </td>
      <td>
        <CommaSeparated>
          {alts?.map((alt) => (
            <HoverableObject object={alt} key={alt.ID}>
              <HighlightedObjectField
                object={alt}
                query={input}
                field={SearchableField.NameAny}
                showOriginalName={true}
              />
            </HoverableObject>
          ))}
        </CommaSeparated>
      </td>
    </tr>
  );
};

export default DecoderTable;
