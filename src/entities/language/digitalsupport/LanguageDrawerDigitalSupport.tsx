import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import type { LanguageData } from '../LanguageTypes';

import {
  DIGITAL_SUPPORT_CATEGORIES,
  getDigitalSupportStatus,
} from './computeLanguageDigitalSupportStatus';
import DigitalSupportCategoryRow from './DigitalSupportCategoryRow';
import DigitalSupportDimensionBreakdown from './DigitalSupportDimensionBreakdown';
import DigitalSupportStatusIcon from './DigitalSupportStatusIcon';
import { DigitalSupportDimension } from './DigitalSupportTypes';

type Props = {
  lang: LanguageData;
};

/**
 * The drawer reuses the same semantic status design as the main Language Details view: a compact
 * overall status in the collapsed row, expanding to a per-category breakdown. Both views derive
 * everything from getDigitalSupportStatus so they can never report conflicting support states.
 */
const LanguageDrawerDigitalSupport: React.FC<Props> = ({ lang }) => {
  const hasData = !!lang.digitalSupportScore;
  const overall = getDigitalSupportStatus(lang, DigitalSupportDimension.Overall);

  return (
    <DrawerDetailsField
      label="Digital support"
      hasData={hasData}
      expandedContent={
        hasData ? (
          <ul className="flex flex-col">
            {DIGITAL_SUPPORT_CATEGORIES.map((dimension) => (
              <DigitalSupportCategoryRow
                key={dimension}
                allowWrap
                summary={getDigitalSupportStatus(lang, dimension)}
                title={getDigitalSupportDimensionLabel(dimension)}
              >
                <DigitalSupportDimensionBreakdown lang={lang} dimension={dimension} />
              </DigitalSupportCategoryRow>
            ))}
          </ul>
        ) : undefined
      }
    >
      {hasData ? (
        <div className="flex flex-row items-center gap-1.5">
          <DigitalSupportStatusIcon status={overall.status} />
          <span className="min-w-0 wrap-break-word">{overall.label}</span>
        </div>
      ) : undefined}
    </DrawerDetailsField>
  );
};

export default LanguageDrawerDigitalSupport;
