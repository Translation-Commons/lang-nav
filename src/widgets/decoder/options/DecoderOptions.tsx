import { SquareCheckIcon, SquareIcon } from 'lucide-react';
import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import TerritoryFilterSelector from '@features/transforms/filtering/selectors/TerritoryFilterSelector';

import { Button } from '@shared/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';
import { Toggle } from '@shared/ui/toggle';

import DecoderLanguageSourceSelector from './DecoderLanguageSourceSelector';
import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderOptions: React.FC = () => {
  const { direction, setDirection, includeMacroCodes, setIncludeMacroCodes } =
    useDecoderOptionsContext();
  const [showOptions, setShowOptions] = React.useState(true);

  return (
    <div className="flex flex-row gap-4 items-center m-2">
      <Button className="cursor-pointer" onClick={() => setShowOptions(!showOptions)}>
        Options {showOptions ? '▶' : '◀'}
      </Button>
      {showOptions && (
        <table>
          <tbody>
            <DecoderLanguageSourceSelector />
            <tr>
              <td>Relevant to territory</td>
              <td className="text-sm">
                <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
                  <TerritoryFilterSelector />
                </SelectorDisplayProvider>
              </td>
            </tr>
            <tr>
              <td>Direction</td>
              <td>
                <Tabs
                  value={direction}
                  onValueChange={(value) => setDirection(value as DecoderDirection)}
                >
                  <TabsList>
                    <TabsTrigger value={DecoderDirection.NamesToCodes}>Names → Codes</TabsTrigger>
                    <TabsTrigger value={DecoderDirection.CodesToNames}>Codes → Names</TabsTrigger>
                  </TabsList>
                </Tabs>
              </td>
            </tr>
            <tr>
              <td>Macrolanguage codes</td>
              <td>
                <Toggle
                  pressed={includeMacroCodes}
                  onPressedChange={() => setIncludeMacroCodes((prev) => !prev)}
                >
                  {includeMacroCodes ? <SquareCheckIcon /> : <SquareIcon />} include codes? eg.{' '}
                  <code>zho/cmn</code>
                </Toggle>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DecoderOptions;
