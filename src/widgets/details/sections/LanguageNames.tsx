import React from 'react';

import { SearchableField } from '@features/params/PageParamTypes';
import ObjectFieldHighlightedByPageSearch from '@features/transforms/search/ObjectFieldHighlightedByPageSearch';

import LanguageCanonicalName from '@entities/language/LanguageCanonicalName';
import LanguageOtherNames, { getLanguageOtherNames } from '@entities/language/LanguageOtherNames';
import { LanguageData } from '@entities/language/LanguageTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';

const LanguageNames: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { nameDisplay, nameCanonical, nameEndonym, nameFrench, Glottolog, ISO, CLDR, Ethnologue } =
    lang;

  return (
    <DetailsSection title="Names">
      <DetailsField title="Canonical Name">
        <LanguageCanonicalName lang={lang} />
      </DetailsField>
      {nameEndonym && nameDisplay !== nameEndonym && (
        <DetailsField title="Endonym">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameEndonym} />
        </DetailsField>
      )}
      {nameFrench && nameFrench !== nameCanonical.toLowerCase() && (
        <DetailsField title="French Name">{nameFrench}</DetailsField>
      )}
      {Glottolog.name && nameCanonical !== Glottolog.name && (
        <DetailsField title="Glottolog Name">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameGlottolog} />
        </DetailsField>
      )}
      {ISO.name && nameCanonical !== ISO.name && (
        <DetailsField title="ISO Name">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameISO} />
        </DetailsField>
      )}
      {CLDR.name && nameCanonical !== CLDR.name && (
        <DetailsField title="CLDR Name">
          <ObjectFieldHighlightedByPageSearch object={lang} field={SearchableField.NameCLDR} />
        </DetailsField>
      )}
      {Ethnologue.name && nameCanonical !== Ethnologue.name && (
        <DetailsField title="Ethnologue Name">
          <ObjectFieldHighlightedByPageSearch
            object={lang}
            field={SearchableField.NameEthnologue}
          />
        </DetailsField>
      )}
      {getLanguageOtherNames(lang).length > 0 && (
        <DetailsField title="Other names">
          <LanguageOtherNames lang={lang} />
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageNames;
