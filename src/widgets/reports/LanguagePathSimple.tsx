import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';

const LanguagePath: React.FC<{
  path: LanguageCode[];
  getLanguage: (code: LanguageCode) => LanguageData | undefined;
}> = ({ path, getLanguage }) => {
  return (
    <div>
      {path.map((langId, positionInCycle) => {
        const lang = getLanguage(langId);
        return (
          <React.Fragment key={positionInCycle}>
            {positionInCycle > 0 && ' > '}
            <HoverableEntityName ent={lang} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default LanguagePath;
