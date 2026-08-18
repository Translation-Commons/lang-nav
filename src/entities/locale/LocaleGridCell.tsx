import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LocaleData } from '@entities/locale/LocaleTypes';

type Props = {
  locale: LocaleData;
};

const LocaleGridCell: React.FC<Props> = ({ locale }) => {
  return (
    <div className="LocaleGridCell">
      {/* to match the design doc */}
      <code>{locale.codeDisplay}</code>{' '}
      <HoverableObjectName object={locale} labelSource="locale without territory" />
    </div>
  );
};

export default LocaleGridCell;
