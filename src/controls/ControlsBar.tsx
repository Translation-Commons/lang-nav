import React from 'react';

import LanguageSchemaSelector from './selectors/LanguageSchemaSelector';
import LanguageScopeSelector from './selectors/LanguageScopeSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import SortBySelector from './selectors/SortBySelector';
import TerritoryScopeSelector from './selectors/TerritoryScopeSelector';

import './controls.css';

const ControlsBar: React.FC = () => {
  return (
    <>
      <LanguageSchemaSelector />
      <LimitInput />
      <SortBySelector />
      <LanguageScopeSelector />
      <TerritoryScopeSelector />
      <LocaleSeparatorSelector />
    </>
  );
};

export default ControlsBar;
