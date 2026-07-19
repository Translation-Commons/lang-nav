import React from 'react';
import { useLocation } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes.tsx';

import LimitInput from '@features/pagination/LimitInput';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import ScaleBySelector from '@features/transforms/scales/ScaleBySelector';
import SearchBySelector from '@features/transforms/search/SearchBySelector';

import ClearAllPinsButton from './selectors/ClearAllPinsButton';
import LocaleSeparatorSelector from './selectors/LocaleSeparatorSelector';
import PageBrightnessSelector from './selectors/PageBrightnessSelector';
import ProfileSelector from './selectors/ProfileSelector';

const Settings = (): React.ReactNode => {
  const location = useLocation();
  const isDataPage = location.pathname === '/' + LangNavPageName.Data;

  return (
    <ViewSettingsPanel>
      {isDataPage && (
        <>
          <LimitInput />
          <ColorBySelector />
          <ColorGradientSelector />
          <ScaleBySelector />
          <FieldFocusSelector />
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
  return <div className="flex w-max flex-col items-end gap-2">{children}</div>;
};

export default Settings;
