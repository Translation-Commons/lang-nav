import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralGridButton from '@entities/language/plurals/LanguagePluralGridToggle';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import CommaSeparated from '@shared/ui/CommaSeparated';

type Props = { lang: LanguageData };

const LanguageAttributes: React.FC<Props> = ({ lang }) => {
  const { modality, primaryWritingSystem, writingSystems } = lang;

  return (
    <DetailsSection title="Attributes">
      {modality != null && (
        <DetailsField title="Modality">{getModalityLabel(modality)}</DetailsField>
      )}
      {primaryWritingSystem && (
        <DetailsField title="Primary Writing System">
          <HoverableObjectName object={primaryWritingSystem} />
        </DetailsField>
      )}
      {Object.values(writingSystems).length > 0 && (
        <DetailsField title="Writing Systems">
          <CommaSeparated>
            {Object.values(writingSystems)
              .sort(getSortFunction())
              .map((writingSystem) => (
                <HoverableObjectName key={writingSystem.ID} object={writingSystem} />
              ))}
          </CommaSeparated>
        </DetailsField>
      )}
      <DetailsField title="Plural Categories">
        <div
          style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'start', gap: '0.5em' }}
        >
          <LanguagePluralCategories lang={lang} />
          <LanguagePluralGridButton lang={lang} />
        </div>
      </DetailsField>
    </DetailsSection>
  );
};

export default LanguageAttributes;
