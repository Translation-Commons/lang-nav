import React from 'react';

import { DrawerDetailsField, DrawerDetailsSection } from '@widgets/details/ui/DrawerDetailsSection';

import PopulationFocus from '@entities/types/PopulationFocus';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { LanguageData } from './LanguageTypes';
import LanguageDrawerPopRow from './population/LanguageDrawerPopRow';
import LanguageDrawerDialectsRow from './relations/LanguageDrawerDialectsRow';
import LanguageDrawerWritingSystemsRow from './writing/LanguageDrawerWritingSystemsRow';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerSummary: React.FC<Props> = ({ lang }) => {
  return (
    <DrawerDetailsSection title="At a glance">
      <DrawerDetailsField
        label="Name"
        expandedContent={
          (lang.names?.length ?? 0) > 1 ? (
            <CommaSeparated limit={null}>{lang.names}</CommaSeparated>
          ) : undefined
        }
      >
        {lang.nameDisplay}
      </DrawerDetailsField>
      <LanguageDrawerPopRow lang={lang} populationFocus={PopulationFocus.Speaking} />
      <LanguageDrawerPopRow lang={lang} populationFocus={PopulationFocus.Writing} />
      <DrawerDetailsField label="Level">{getLanguageScopeLabel(lang.scope)}</DrawerDetailsField>
      <LanguageDrawerDialectsRow lang={lang} />
      {lang.modality != null ? (
        <DrawerDetailsField label="Medium of Use">
          {getModalityLabel(lang.modality)}
        </DrawerDetailsField>
      ) : null}
      <LanguageDrawerWritingSystemsRow lang={lang} />
    </DrawerDetailsSection>
  );
};

export default LanguageDrawerSummary;
