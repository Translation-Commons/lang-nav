import React from 'react';
import { useLocation } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes.tsx';

import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import SearchBySelector from '@features/transforms/search/SearchBySelector';

import ClearAllPinsButton from './selectors/ClearAllPinsButton';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import PageBrightnessSelector from './selectors/PageBrightnessSelector';
import PopulationFocusSelector from './selectors/PopulationFocusSelector';
import ProfileSelector from './selectors/ProfileSelector';

const Settings = (): React.ReactNode => {
  const location = useLocation();
  const isDataPage = location.pathname === '/' + LangNavPageName.Data;

  return (
    <div className="grid grid-cols-2 gap-2 items-center">
      {isDataPage && (
        <>
          <FieldFocusSelector />
          <PopulationFocusSelector />
          <LocaleSeparatorSelector />
          <ProfileSelector />
          <ClearAllPinsButton />
        </>
      )}
      <SearchBySelector />
      <PageBrightnessSelector />
    </div>
  );
};

export default Settings;
