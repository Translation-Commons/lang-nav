import React from 'react';

import { LanguageSource } from '@entities/language/LanguageTypes';

import EnumButtons from '@shared/ui/EnumButtons';

const LanguageSourceSelector: React.FC = () => {
  return (
    <EnumButtons
      options={[
        LanguageSource.Combined,
        LanguageSource.Glottolog,
        LanguageSource.ISO,
        LanguageSource.BCP,
        LanguageSource.CLDR,
      ]}
      paramKey="languageSource"
    />
  );
};

export default LanguageSourceSelector;
