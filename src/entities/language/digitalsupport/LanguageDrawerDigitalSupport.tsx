import React from 'react';

import { DrawerDetailsField } from '@widgets/details/ui/DrawerDetailsSection';

import { numberToSigFigs } from '@shared/lib/numberUtils';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import { LanguageData } from '../LanguageTypes';

import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import { DigitalSupportDimension } from './DigitalSupportTypes';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerContents: React.FC<Props> = ({ lang }) => {
  const digitalSupport = lang.digitalSupportScore;

  return (
    <DrawerDetailsField
      label="Digital support"
      hasData={!!lang.digitalSupportScore}
      expandedContent={
        <table>
          <tbody>
            {Object.values(DigitalSupportDimension)
              .filter(
                (dimension) =>
                  digitalSupport?.[dimension] != null &&
                  dimension !== DigitalSupportDimension.Overall,
              )
              .map((dimension) => (
                <tr key={dimension}>
                  <td>{getDigitalSupportDimensionLabel(dimension)}</td>
                  <td>{numberToSigFigs(digitalSupport?.[dimension] ?? 0, 2)}/10</td>
                  <td>
                    <LanguageDigitalSupportMeter lang={lang} dim={dimension} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      }
    >
      <div className="flex flex-row gap-1 items-center">
        {digitalSupport?.[DigitalSupportDimension.Overall] != null &&
          `${numberToSigFigs(digitalSupport?.[DigitalSupportDimension.Overall], 2)}/10`}
        <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.Overall} />
      </div>
    </DrawerDetailsField>
  );
};

export default LanguageDrawerContents;
