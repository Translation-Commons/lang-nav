import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import TerritoryFilterSelector from '@features/transforms/filtering/selectors/TerritoryFilterSelector';

import DecoderLanguageSourceSelector from './DecoderLanguageSourceSelector';
import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderOptions: React.FC = () => {
  const { direction, setDirection, includeMacroCodes, setIncludeMacroCodes } =
    useDecoderOptionsContext();
  const [showOptions, setShowOptions] = React.useState(true);

  return (
    <div className="flex flex-row gap-4 items-center m-2">
      <div className="font-bold">
        <button onClick={() => setShowOptions(!showOptions)}>
          Options {showOptions ? '▶' : '◀'}
        </button>
      </div>
      {showOptions && (
        <div className="flex flex-col gap-2 ">
          <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
            <DecoderLanguageSourceSelector />
            <div className="flex flex-row gap-1 items-center">
              Relevant to territory:
              <TerritoryFilterSelector />
            </div>
          </SelectorDisplayProvider>
          <div className="flex gap-2">
            <button
              className={(direction === DecoderDirection.NamesToCodes ? 'primary' : '') + ' py-1!'}
              onClick={() => setDirection(DecoderDirection.NamesToCodes)}
            >
              Names → Codes
            </button>
            <button
              className={(direction === DecoderDirection.CodesToNames ? 'primary' : '') + ' py-1!'}
              onClick={() => setDirection(DecoderDirection.CodesToNames)}
            >
              Codes → Names
            </button>
          </div>
          <div>
            <label className="font-normal!">
              <input
                className="mr-2"
                type="checkbox"
                checked={includeMacroCodes}
                onChange={(e) => setIncludeMacroCodes(e.target.checked)}
              />
              Include macrolanguage codes (eg. <code>zho/cmn</code> instead of just <code>cmn</code>
              )
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecoderOptions;
