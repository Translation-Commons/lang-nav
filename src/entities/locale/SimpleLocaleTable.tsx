import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import getFieldForPopulationFocus from '@features/transforms/fields/getFieldForPopulationFocus';

import PopulationFocus from '@entities/types/PopulationFocus';

import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';

import { LocaleData } from './LocaleTypes';

/** To place in areas with little space */
const SimpleLocaleTable: React.FC<{
  locales: LocaleData[];
  populationFocus: PopulationFocus;
  labelSource: 'territory' | 'language';
}> = ({ locales, populationFocus, labelSource }) => {
  const speakingOrWriting = populationFocus === PopulationFocus.Writing ? 'writing' : 'speaking';
  return (
    <LocalParamsProvider
      overrides={{ populationFocus, sortBy: getFieldForPopulationFocus(populationFocus) }}
    >
      <table className="w-fit">
        <tbody>
          {locales.slice(0, 10).map((l) => (
            <tr key={l.ID}>
              <td className="pr-4">
                <HoverableEntityName key={l.ID} ent={l} labelSource={labelSource} />
              </td>
              <td className="pr-4 text-right">
                <DecimalNumber
                  num={l.pop[speakingOrWriting].percentAdjusted ?? 0}
                  alignFraction={false}
                />
                %
              </td>
              <td className="text-right">
                <CountOfPeople count={l.pop[speakingOrWriting].adjusted ?? 0} />
              </td>
            </tr>
          ))}
          {locales.length > 10 && (
            <tr>
              <td colSpan={3} className="text-center text-muted-foreground">
                and {locales.length - 10} more...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </LocalParamsProvider>
  );
};

export default SimpleLocaleTable;
