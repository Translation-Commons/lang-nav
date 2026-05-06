import { SettingsIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes.tsx';

import { OptionsPanelSection } from '@widgets/controls/OptionsPanel.tsx';

import HoverableButton from '@features/layers/hovercard/HoverableButton.tsx';
import ViewModal from '@features/layers/modal/ViewModal.tsx';
import LimitInput from '@features/pagination/LimitInput';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';
import ScaleBySelector from '@features/transforms/scales/ScaleBySelector';
import SearchBySelector from '@features/transforms/search/SearchBySelector';
import SecondarySortBySelector from '@features/transforms/sorting/SecondarySortBySelector';
import SortBySelector from '@features/transforms/sorting/SortBySelector';
import SortDirectionSelector from '@features/transforms/sorting/SortDirectionSelector';

import LocaleSeparatorSelector from '../controls/selectors/LocaleSeparatorSelector';
import PageBrightnessSelector from '../controls/selectors/PageBrightnessSelector';
import ProfileSelector from '../controls/selectors/ProfileSelector';

const Settings = (): React.ReactNode => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);

  const location = useLocation();

  // Close the dropdown when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isDataPage = location.pathname === '/' + LangNavPageName.Data;

  return (
    <>
      <HoverableButton
        className="primary"
        onClick={() => setIsOpen(true)}
        style={{ padding: '0.5em' }}
      >
        <SettingsIcon size="1.5em" display="block" />
      </HoverableButton>
      <div className={'view-settings'} style={{ fontSize: '0.9em' }}>
        <ViewModal
          className="top-right"
          isOpen={isOpen}
          onClose={onClose}
          title="View settings"
          bodyStyle={{
            width: '90vw',
            maxWidth: '20em',
            padding: '1em',
            color: 'var(--color-text)',
          }}
        >
          <OptionsPanelSection title="View options" optionsName="view options" fullView={true}>
            {isDataPage && (
              <>
                <LimitInput />
                <SortBySelector />
                <SecondarySortBySelector />
                <SortDirectionSelector />
                <ColorBySelector />
                <ColorGradientSelector />
                <ScaleBySelector />
                <FieldFocusSelector />
                <LocaleSeparatorSelector />
                <ProfileSelector />
              </>
            )}
            <SearchBySelector />
            <PageBrightnessSelector />
          </OptionsPanelSection>
        </ViewModal>
      </div>
    </>
  );
};

export default Settings;
