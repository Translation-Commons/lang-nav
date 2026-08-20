import { TriangleAlertIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import HoverableObject from '@features/layers/hovercard/HoverableObject';
import { SearchableField } from '@features/params/PageParamTypes';
import getSearchableField from '@features/transforms/search/getSearchableField';

import { LanguageData } from '@entities/language/LanguageTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LoadingIcon from '@shared/ui/LoadingIcon';

import { useDecoderDataContext } from './DecoderDataContext';
import { DecoderDirection, useDecoderOptionsContext } from './options/DecoderOptionsContext';

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
        <tr>
          {/* <th>Input</th> */}
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
          {/* <td></td> */}
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
  const { includeMacroCodes, direction } = useDecoderOptionsContext();
  const { getResult, isSearchActive } = useDecoderDataContext();
  const { lang, codeWithMacro, alts } = getResult(input) ?? {};

  if (input.trim() === '' || input.startsWith('#'))
    return (
      <tr>
        {/* <td>{input}</td> */}
        <td>{direction === DecoderDirection.CodesToNames && input}</td>
        <td>{direction === DecoderDirection.NamesToCodes && input}</td>
        <td></td>
      </tr>
    );

  return (
    <tr>
      {/* <td className="px-1">{input}</td> */}
      <td className="px-1">
        {(includeMacroCodes ? codeWithMacro : undefined) ?? lang?.codeDisplay}
      </td>
      <td className="px-1 relative">
        {isSearchActive && (
          <div className="absolute right-0 top-0 mr-1 mt-1">
            <LoadingIcon />
          </div>
        )}
        {lang ? (
          <LanguageLabel lang={lang} input={input} />
        ) : (
          <div className="flex items-center gap-1 text-(--color-text-secondary) italic">
            <TriangleAlertIcon display="inline-block" size="1em" /> {input} not found
          </div>
        )}
      </td>
      <td className="px-1 max-w-200">
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
  const searchResult = getSearchableField(lang, SearchableField.NameAny, input.toLowerCase());
  return (
    <HoverableObject object={lang}>
      {lang.nameDisplay}
      {searchResult && lang.nameDisplay.toLowerCase() !== searchResult.toLowerCase() && (
        <Deemphasized> ({searchResult})</Deemphasized>
      )}
    </HoverableObject>
  );
};

export default DecoderTable;
