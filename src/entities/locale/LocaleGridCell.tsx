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
      <HoverableObjectName ent={locale} labelSource="locale without language" />
    </div>
  );
};

export default LocaleGridCell;
