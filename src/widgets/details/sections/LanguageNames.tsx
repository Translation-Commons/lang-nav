import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import LanguageCanonicalName from '@entities/language/LanguageCanonicalName';
import LanguageOtherNames, { getLanguageOtherNames } from '@entities/language/LanguageOtherNames';
import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { normalizeBase, toTitleCase } from '@shared/lib/stringUtils';

const LanguageNames: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { nameDisplay, nameEndonym, nameFrench, Glottolog, ISO, CLDR } = lang;

  return (
    <DetailsSection title="Names">
      <DetailsField title="Canonical Name:">
        <LanguageCanonicalName lang={lang} />
      </DetailsField>
      {nameEndonym && nameDisplay !== nameEndonym && (
        <DetailsField title="Endonym:">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameEndonym} />
        </DetailsField>
      )}
      {nameFrench && normalizeBase(toTitleCase(nameFrench)) !== normalizeBase(nameDisplay) && (
        <DetailsField title="French Name:">{nameFrench}</DetailsField>
      )}
      {Glottolog.name && nameDisplay !== Glottolog.name && (
        <DetailsField title="Glottolog Name:">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameGlottolog} />
        </DetailsField>
      )}
      {ISO.name && nameDisplay !== ISO.name && (
        <DetailsField title="ISO Name:">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameISO} />
        </DetailsField>
      )}
      {CLDR.name && nameDisplay !== CLDR.name && (
        <DetailsField title="CLDR Name:">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameCLDR} />
        </DetailsField>
      )}
      {getLanguageOtherNames(lang).length > 0 && (
        <DetailsField title="Other names:">
          <LanguageOtherNames lang={lang} />
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageNames;
