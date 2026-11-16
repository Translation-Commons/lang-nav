import React from 'react';

import HoverableEntityRef from '@features/layers/hovercard/HoverableEntityRef';

import type { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
  className?: string;
};

const LanguageStandardRegisterNote: React.FC<Props> = ({ lang, className }) => {
  if (!lang.standardLanguage) return null;
  if (lang.ID === lang.standardLanguage.ID) return null;
  return (
    <span className={className}>
      Most writers use the standard register: <HoverableEntityRef entRef={lang.standardLanguage} />.
    </span>
  );
};

export default LanguageStandardRegisterNote;
