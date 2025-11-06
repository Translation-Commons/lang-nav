import React from 'react';

import LanguageScopeSelector from './selectors/LanguageScopeSelector';
import LanguageSourceSelector from './selectors/LanguageSourceSelector';
import LimitInput from '../../features/pagination/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import SortBySelector from './selectors/SortBySelector';
import TerritoryScopeSelector from './selectors/TerritoryScopeSelector';

import './controls.css';

const ControlsBar: React.FC = () => {
  return (
    <>
      <LanguageSourceSelector />
      <LimitInput />
      <SortBySelector />
      <LanguageScopeSelector />
      <TerritoryScopeSelector />
      <LocaleSeparatorSelector />
    </>
  );
};

export default ControlsBar;
