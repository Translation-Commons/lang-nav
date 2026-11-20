import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getDigitalSupportCategoryLabel } from '@strings/DigitalSupportStrings';

import DigitalSupportCellDisplay from './DigitalSupportCellDisplay';
import {
    DigitalSupportCategory,
    DigitalSupportCategoryFactors,
    DigitalSupportColumn,
    DigitalSupportFactor,
    DigitalSupportTier,
    DigitalSupportTierCategories,
} from './DigitalSupportTypes';

type Props = DigitalSupportColumn & {
  ent: LanguageData;
};

const DigitalSupportHoverableCell: React.FC<Props> = (props) => {
  const { cat, factor } = props;
  return (
    <div className="p-1">
      <HoverCard>
        <HoverCardTrigger delay={100} className="cursor-help">
          <DigitalSupportCellDisplay {...props} />
        </HoverCardTrigger>
        <HoverCardContent className="w-fit">
          {factor == null && cat == null && <FullTable {...props} />}
          {factor == null && cat != null && <CategoryTable {...props} cat={cat} />}
          {factor != null && <>TODO add more details</>}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

const FullTable: React.FC<Props> = (props) => {
  const { tier } = props;
  return (
    <table>
      <tbody>
        <tr>
          <th className="text-left">{DigitalSupportTier[tier]}</th>
          <td>
            <DigitalSupportCellDisplay {...props} />
          </td>
        </tr>
        {DigitalSupportTierCategories[tier].map((cat) => (
          <>
            <tr key={cat}>
              <td className="px-4">{getDigitalSupportCategoryLabel(cat)}</td>
              <td className="px-4">
                <DigitalSupportCellDisplay {...props} cat={cat} />
              </td>
            </tr>
            {DigitalSupportCategoryFactors[cat].map((factor) => (
              <tr key={factor}>
                <td className="px-8">{DigitalSupportFactor[factor]}</td>
                <td className="px-8 w-32">
                  <DigitalSupportCellDisplay {...props} cat={cat} factor={factor} />
                </td>
              </tr>
            ))}
          </>
        ))}
      </tbody>
    </table>
  );
};

const CategoryTable: React.FC<Props & { cat: DigitalSupportCategory }> = (props) => {
  const { cat } = props;
  return (
    <table>
      <tbody>
        <tr>
          <th className="text-left">{getDigitalSupportCategoryLabel(cat)}</th>
          <td>
            <DigitalSupportCellDisplay {...props} />
          </td>
        </tr>
        {DigitalSupportCategoryFactors[cat].map((factor) => (
          <tr key={factor}>
            <td className="px-4">{DigitalSupportFactor[factor]}</td>
            <td className="px-4 w-24">
              <DigitalSupportCellDisplay {...props} cat={cat} factor={factor} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DigitalSupportHoverableCell;
