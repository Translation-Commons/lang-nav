import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import CommaSeparated from '@shared/ui/CommaSeparated';
import { Spinner } from '@shared/ui/spinner';

import { useDecoderDataContext } from './DecoderDataContext';
import { DecoderDirection, useDecoderOptionsContext } from './options/DecoderOptionsContext';

const DecoderRow: React.FC<{ input: string }> = ({ input }) => {
  const { includeMacroCodes, direction } = useDecoderOptionsContext();
  const { getResult } = useDecoderDataContext();
  const result = getResult(input);

  const { lang, codeWithMacro, alts } = result ?? {};

  if (input.trim() === '' || input.startsWith('#')) {
    return (
      <tr>
        <td>&nbsp;</td>
        <td></td>
      </tr>
    );
  }

  if (!result) {
    return (
      <tr>
        <td>
          <Spinner aria-hidden="true" className="inline size-[1em]" />
        </td>
        <td></td>
      </tr>
    );
  }

  if (!lang) {
    return (
      <tr>
        <td colSpan={2}>
          <div className="flex items-center gap-1 text-(--color-text-secondary) italic">
            <TriangleAlertIcon display="inline-block" size="1em" /> <strong>{input}</strong> not
            found
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-1 text-nowrap truncate ellipsis max-w-50">
        {lang ? (
          direction === DecoderDirection.CodesToNames ? (
            <HoverableEntity ent={lang}>{lang.nameDisplay}</HoverableEntity>
          ) : (
            <HoverableEntity ent={lang}>
              {(includeMacroCodes ? codeWithMacro : undefined) ?? lang.codeDisplay}
            </HoverableEntity>
          )
        ) : (
          <div className="flex items-center gap-1 text-(--color-text-secondary) italic">
            <TriangleAlertIcon display="inline-block" size="1em" /> <strong>{input}</strong> not
            found
          </div>
        )}
      </td>
      <td className="px-1 max-w-200 truncate ellipsis">
        <CommaSeparated limit={1000}>
          {alts?.map((alt) => (
            <HoverableEntityName
              key={alt.ID}
              ent={alt}
              labelSource={direction === DecoderDirection.CodesToNames ? 'name' : 'code'}
            />
          ))}
        </CommaSeparated>
      </td>
    </tr>
  );
};

export default DecoderRow;
