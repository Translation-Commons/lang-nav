import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import { getDigitalSupportCategoryLabel } from '@strings/DigitalSupportStrings';

import DigitalSupportCellDisplay from './DigitalSupportCellDisplay';
import DigitalSupportFactorExplanation from './DigitalSupportFactorExplanation';
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
  const { cat, factor, ent } = props;

  return (
    <div className="p-1">
      <HoverCard>
        <HoverCardTrigger delay={100} className="cursor-help">
          <DigitalSupportCellDisplay {...props} />
        </HoverCardTrigger>
        <HoverCardContent className="w-fit">
          {factor == null && cat == null && <FullTable {...props} />}
          {factor == null && cat != null && <CategoryTable {...props} cat={cat} />}
          {factor != null && <DigitalSupportFactorExplanation ent={ent} factor={factor} />}
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
          <React.Fragment key={cat}>
            <tr>
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
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

const CategoryTable: React.FC<Props & { cat: DigitalSupportCategory }> = (props) => {
  const { cat, ent } = props;
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
              {factor == null ? (
                <DigitalSupportCellDisplay {...props} cat={cat} factor={factor} />
              ) : (
                <HoverCard>
                  <HoverCardTrigger delay={100} className="cursor-help">
                    <DigitalSupportCellDisplay {...props} factor={factor} />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-fit">
                    <DigitalSupportFactorExplanation ent={ent} factor={factor} />
                  </HoverCardContent>
                </HoverCard>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DigitalSupportHoverableCell;
