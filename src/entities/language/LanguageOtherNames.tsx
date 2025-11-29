import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';

import Highlightable from '@shared/ui/Highlightable';

const LanguageOtherNames: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { searchString } = usePageParams();
  const otherNames = getLanguageOtherNames(lang);

  return otherNames.map((name, idx) => (
    <React.Fragment key={idx}>
      {idx > 0 && ', '}
      <Highlightable text={name} searchPattern={searchString} />
    </React.Fragment>
  ));
};

export function getLanguageOtherNames(lang: LanguageData): string[] {
  const { nameDisplay, nameEndonym, Glottolog, ISO, CLDR } = lang;
  return lang.names.filter(
    (name) => ![nameDisplay, nameEndonym, Glottolog.name, ISO.name, CLDR.name].includes(name),
  );
}

export default LanguageOtherNames;
