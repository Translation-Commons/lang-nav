import React from 'react';

import GranularitySelector from './selectors/GranularitySelector';
import LanguageSchemaSelector from './selectors/LanguageSchemaSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import SortBySelector from './selectors/SortBySelector';

import './controls.css';

const ControlsBar: React.FC = () => {
  return (
    <>
      <LanguageSchemaSelector />
      <LimitInput />
      <SortBySelector />
      <GranularitySelector />
      <LocaleSeparatorSelector />
    </>
  );
};

export default ControlsBar;
