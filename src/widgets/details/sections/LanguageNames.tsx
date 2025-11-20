import React from 'react';

import LanguageCanonicalName from '@entities/language/LanguageCanonicalName';
import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';

const LanguageNames: React.FC<{ lang: LanguageData }> = ({ lang }) => {
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
        <DetailsField title="Endonym:">{nameEndonym}</DetailsField>
      )}
      {Glottolog.name && nameDisplay !== Glottolog.name && (
        <DetailsField title="Glottolog Name:">{Glottolog.name}</DetailsField>
      )}
      {ISO.name && nameDisplay !== ISO.name && (
        <DetailsField title="ISO Name:">{ISO.name}</DetailsField>
      )}
      {CLDR.name && nameDisplay !== CLDR.name && (
        <DetailsField title="CLDR Name:">{CLDR.name}</DetailsField>
      )}
      {otherNames.length > 0 && (
        <DetailsField title="Other names:">{otherNames.join(', ')}</DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageNames;
