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
    <ViewSettingsPanel>
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
    </ViewSettingsPanel>
  );
};

const ViewSettingsPanel: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5em',
        flexDirection: 'column',
        alignItems: 'flex-end',
        width: 'max-content',
      }}
    >
      {children}
    </div>
  );
};

export default Settings;
