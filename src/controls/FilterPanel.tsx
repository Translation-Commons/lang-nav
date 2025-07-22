import React from 'react';

import LanguageSchemaSelector from './selectors/LanguageSchemaSelector';
import LimitInput from './selectors/LimitInput';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import ScopeFilterSelector from './selectors/ScopeFilterSelector';
import SortBySelector from './selectors/SortBySelector';

const FilterPanel: React.FC = () => {
  return (
    <>
      <div style={{ padding: '0.5em 0' }}>Filters</div>
      <LanguageSchemaSelector />
      <ScopeFilterSelector />
      <div style={{ padding: '0.5em 0' }}>View Options</div>
      <LimitInput />
      <SortBySelector />
      <LocaleSeparatorSelector />
    </>
  );
};

export default FilterPanel;
