import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import { SearchableField } from '@features/params/PageParamTypes';
import getSearchableField from '@features/transforms/search/getSearchableField';

import { LanguageData } from '@entities/language/LanguageTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import { Spinner } from '@shared/ui/spinner';

import { useDecoderDataContext } from './DecoderDataContext';
import { DecoderDirection, useDecoderOptionsContext } from './options/DecoderOptionsContext';

const DecoderRow: React.FC<{ input: string }> = ({ input }) => {
  const { includeMacroCodes, direction } = useDecoderOptionsContext();
  const { getResult, isSearchActive } = useDecoderDataContext();
  const result = getResult(input);
  const [isAltsTruncated, setIsAltsTruncated] = React.useState(true);

  const { lang, codeWithMacro, alts } = result ?? {};

  if (input.trim() === '' || input.startsWith('#'))
    return (
      <tr>
        <td>{direction === DecoderDirection.CodesToNames && input}</td>
        <td>{direction === DecoderDirection.NamesToCodes && input}</td>
        <td></td>
      </tr>
    );

  return (
    <tr>
      <td className="px-1">
        {(includeMacroCodes ? codeWithMacro : undefined) ?? lang?.codeDisplay}
      </td>
      <td className="px-1 text-nowrap truncate ellipsis max-w-50">
        {!result && isSearchActive && <Spinner aria-hidden="true" className="inline size-[1em]" />}
        {lang ? (
          <LanguageLabel lang={lang} input={input} />
        ) : (
          <div className="flex items-center gap-1 text-(--color-text-secondary) italic">
            <TriangleAlertIcon display="inline-block" size="1em" /> {input} not found
          </div>
        )}
      </td>
      <td className={'px-1 max-w-200' + (isAltsTruncated ? ' truncate' : '')}>
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
    <HoverableEntity ent={lang}>
      {lang.nameDisplay}
      {searchResult && lang.nameDisplay.toLowerCase() !== searchResult.toLowerCase() && (
        <Deemphasized> ({searchResult})</Deemphasized>
      )}
    </HoverableEntity>
  );
};

export default DecoderRow;
