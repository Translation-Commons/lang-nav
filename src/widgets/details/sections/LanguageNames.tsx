import React from 'react';

import usePageParams from '@features/params/usePageParams';

import LanguageCanonicalName from '@entities/language/LanguageCanonicalName';
import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Highlightable from '@shared/ui/Highlightable';

const LanguageNames: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { searchString } = usePageParams();
  const { nameDisplay, nameEndonym, Glottolog, ISO, CLDR } = lang;

  // nameDisplay and nameEndonym should already be shown in the title for this
  const otherNames = lang.names.filter(
    (name) => ![nameDisplay, nameEndonym, Glottolog.name, ISO.name, CLDR.name].includes(name),
  );

  return (
    <DetailsSection title="Names">
      <DetailsField title="Canonical Name:">
        <LanguageCanonicalName lang={lang} />
      </DetailsField>
      {nameEndonym && nameDisplay !== nameEndonym && (
        <DetailsField title="Endonym:">
          <Highlightable text={nameEndonym} searchPattern={searchString} />
        </DetailsField>
      )}
      {Glottolog.name && nameDisplay !== Glottolog.name && (
        <DetailsField title="Glottolog Name:">
          <Highlightable text={Glottolog.name} searchPattern={searchString} />
        </DetailsField>
      )}
      {ISO.name && nameDisplay !== ISO.name && (
        <DetailsField title="ISO Name:">
          <Highlightable text={ISO.name} searchPattern={searchString} />
        </DetailsField>
      )}
      {CLDR.name && nameDisplay !== CLDR.name && (
        <DetailsField title="CLDR Name:">
          <Highlightable text={CLDR.name} searchPattern={searchString} />
        </DetailsField>
      )}
      {otherNames.length > 0 && (
        <DetailsField title="Other names:">
          {otherNames.map((name, idx) => (
            <>
              {idx > 0 && ', '}
              <Highlightable key={name} text={name} searchPattern={searchString} />
            </>
          ))}
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageNames;
