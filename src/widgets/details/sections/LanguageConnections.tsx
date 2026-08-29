import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { LanguageData } from '@entities/language/LanguageTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

const LanguageConnections: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { getCLDRLanguage } = useDataContext();
  const { ISO, Glottolog, variants, equivalentVariant } = lang;
  const relatedLanguages = (lang.CLDR.languageMatch ?? [])
    .map((match) => ({
      match,
      relatedLanguage: getCLDRLanguage(match.supported),
    }))
    .filter(
      (entry): entry is { match: (typeof entry)['match']; relatedLanguage: LanguageData } =>
        entry.relatedLanguage != null,
    );

  return (
    <DetailsSection title="Connections">
      {ISO.parentLanguage && (
        <DetailsField title="ISO group">
          <HoverableEntityName ent={ISO.parentLanguage} />
        </DetailsField>
      )}
      {Glottolog.parentLanguage && (
        <DetailsField title="Glottolog group">
          <HoverableEntityName ent={Glottolog.parentLanguage} />
        </DetailsField>
      )}
      {equivalentVariant && (
        <DetailsField title="Equivalent Variant">
          <HoverableEntityName ent={equivalentVariant} labelSource="name and code" />
        </DetailsField>
      )}
      {variants && variants.length > 0 && (
        <DetailsField title="Variants">
          <CommaSeparated>
            {variants.map((v) => (
              <HoverableEntityName key={v.ID} ent={v} labelSource="name and code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLanguages.length > 0 && (
        <DetailsField title="Related Languages (CLDR)">
          <CommaSeparated>
            {relatedLanguages.map(({ match, relatedLanguage }) => (
              <span key={match.desired + ':' + match.supported + ':' + match.distance}>
                <HoverableEntityName ent={relatedLanguage} /> ({match.distance} CLDR)
              </span>
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
    </DetailsSection>
  );
};

export default LanguageConnections;
