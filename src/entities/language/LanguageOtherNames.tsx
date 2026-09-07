import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Highlightable from '@shared/ui/Highlightable';

const LanguageOtherNames: React.FC<{ lang: LanguageData; size?: 'wide' | 'narrow' }> = ({
  lang,
  size = 'wide',
}) => {
  const { searchString } = usePageParams();
  const otherNames = getLanguageOtherNames(lang);

  return (
    <CommaSeparated limitText={size === 'narrow' ? 'short' : 'words'}>
      {otherNames.map((name, idx) => (
        <Highlightable key={idx} text={name} searchPattern={searchString} />
      ))}
    </CommaSeparated>
  );
};

export function getLanguageOtherNames(lang: LanguageData): string[] {
  const { nameCanonical, nameEndonym, Glottolog, ISO, CLDR } = lang;
  return lang.names.filter(
    (name) => ![nameCanonical, nameEndonym, Glottolog.name, ISO.name, CLDR.name].includes(name),
  );
}

export default LanguageOtherNames;
