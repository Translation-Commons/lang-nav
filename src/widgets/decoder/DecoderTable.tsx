import { TriangleAlertIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { SearchableField } from '@features/params/PageParamTypes';
import HighlightedObjectField from '@features/transforms/search/HighlightedObjectField';

import { LanguageData } from '@entities/language/LanguageTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LoadingIcon from '@shared/ui/LoadingIcon';

import { useDecoderDataContext } from './DecoderDataContext';
import { useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderTable: React.FC = () => {
  const { inputLines, getResult } = useDecoderDataContext();

  // Export functionality
  const copyToClipboard = (text: string | string[]) =>
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('\n') : text);
  const copyResultingNames = useCallback(() => {
    copyToClipboard(inputLines.map((l) => getResult(l)?.lang?.nameDisplay ?? ''));
  }, [inputLines, getResult]);
  const copyResultingCodes = useCallback(() => {
    copyToClipboard(inputLines.map((l) => getResult(l)?.lang?.codeDisplay ?? ''));
  }, [inputLines, getResult]);

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
  const { getResult, isSearchActive } = useDecoderDataContext();
  const { lang, codeWithMacro, alts } = getResult(input) ?? {};

  if (input.trim() === '' || input.startsWith('#'))
    return (
      <tr>
        <td></td>
        <td>{input.slice(1)}</td>
        <td></td>
      </tr>
    );

  return (
    <tr>
      <td>{(includeMacroCodes ? codeWithMacro : undefined) ?? lang?.codeDisplay}</td>
      <td className="truncate">
        {isSearchActive && (
          <div className="absolute right-0 top-0 mr-1 mt-1">
            <LoadingIcon />
          </div>
        )}
        {lang ? (
          <LanguageLabel lang={lang} input={input} />
        ) : (
          input && (
            <Deemphasized>
              <div className="flex items-center gap-1">
                <TriangleAlertIcon display="inline-block" />
                <span className="font-bold">{input}</span> not found
              </div>
            </Deemphasized>
          )
        )}
      </td>
      <td className="truncate">
        <CommaSeparated>
          {alts?.map((alt) => (
            <LanguageLabel key={alt.ID} lang={alt} input={input} />
          ))}
        </CommaSeparated>
      </td>
    </tr>
  );
};

const LanguageLabel: React.FC<{ lang: LanguageData; input: string }> = ({ lang, input }) => {
  return (
    <HoverableObject object={lang}>
      {lang.nameDisplay.toLowerCase() != input.toLowerCase() ? (
        <HighlightedObjectField
          object={lang}
          query={input}
          field={SearchableField.NameAny}
          showOriginalName={true}
        />
      ) : (
        lang.nameDisplay
      )}
    </HoverableObject>
  );
};

export default DecoderTable;
