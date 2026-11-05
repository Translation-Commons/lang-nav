import { SquareCheckIcon, SquareIcon } from 'lucide-react';
import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import FiltersPopover from '@features/transforms/filtering/FiltersPopover';
import LanguageCodeFormatSelector from '@features/transforms/filtering/selectors/LanguageCodeFormatSelector';
import TerritoryFilterSelector from '@features/transforms/filtering/selectors/TerritoryFilterSelector';

import { Button } from '@shared/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';
import { Toggle } from '@shared/ui/toggle';

import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderOptions: React.FC = () => {
  const { direction, setDirection, includeMacroCodes, setIncludeMacroCodes } =
    useDecoderOptionsContext();
  const [showOptions, setShowOptions] = React.useState(true);
  const { getLanguage } = useDataContext();
  const zho = getLanguage('zho');
  const cmn = getLanguage('cmn');

  return (
    <div className="flex flex-row gap-4 items-center m-2">
      <Button className="cursor-pointer" onClick={() => setShowOptions(!showOptions)}>
        Options {showOptions ? '▶' : '◀'}
      </Button>
      {showOptions && (
        <table>
          <tbody>
            <tr>
              <td>Direction</td>
              <td>
                <Tabs
                  value={direction}
                  onValueChange={(value) => setDirection(value as DecoderDirection)}
                >
                  <TabsList>
                    <TabsTrigger className="cursor-pointer" value={DecoderDirection.NamesToCodes}>
                      Names → Codes
                    </TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value={DecoderDirection.CodesToNames}>
                      Codes → Names
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </td>
            </tr>
            <tr>
              <td>Language filters</td>
              <td>
                <FiltersPopover />
              </td>
            </tr>
            <tr>
              <td>Language codes</td>
              <td className="flex flex-row gap-4 items-center">
                <LanguageCodeFormatSelector dataSettings={false} />
              </td>
            </tr>
            <tr>
              <td>Relevant to territory</td>
              <td>
                <TerritoryFilterSelector showButtons={false} />
              </td>
            </tr>
            {direction === DecoderDirection.NamesToCodes && (
              <tr>
                <td>Include macro codes</td>
                <td>
                  <Toggle
                    pressed={includeMacroCodes}
                    onPressedChange={() => setIncludeMacroCodes((prev) => !prev)}
                  >
                    {includeMacroCodes ? <SquareCheckIcon /> : <SquareIcon />} include codes? eg.{' '}
                    <code>
                      {zho?.codeDisplay ?? 'zho'}/{cmn?.codeDisplay ?? 'cmn'}
                    </code>
                  </Toggle>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DecoderOptions;
