import { SettingsIcon, XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes.tsx';

import HoverableButton from '@features/layers/hovercard/HoverableButton.tsx';
import ZIndex from '@features/layers/ZIndex';
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      {isOpen && (
        <div
          aria-modal="true"
          className="view-settings"
          role="dialog"
          style={{
            position: 'fixed',
            top: '0.75em',
            right: '0.75em',
            zIndex: ZIndex.FeedbackForm,
            width: '21em',
            maxWidth: '90vw',
            maxHeight: 'calc(100vh - 1.5em)',
            backgroundColor: 'var(--color-background)',
            borderRadius: '0.5em',
            boxShadow: '0 4px 12px var(--color-shadow)',
            color: 'var(--color-text)',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.9em',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5em 1em',
              borderBottom: '1px solid var(--color-shadow)',
            }}
          >
            <span style={{ fontWeight: 600 }}>View settings</span>
            <HoverableButton onClick={onClose} style={{ padding: '0.5em' }}>
              <XIcon size="1em" display="block" />
            </HoverableButton>
          </div>

          {/* Body */}
          <div style={{ padding: '16px', overflow: 'auto' }}>
            <OptionsPanel title="View options" optionsName="view options">
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
            </OptionsPanel>
          </div>
        </div>
      )}
    </>
  );
};

const OptionsPanel: React.FC<
  React.PropsWithChildren<{
    title: string;
    optionsName: string;
    fullView?: boolean;
  }>
> = ({ children }) => {
  const childArray = React.Children.toArray(children);

  return (
    <div
      style={{
        borderTop: 'none',
        width: '95%',
        marginBottom: '0.5em',
      }}
    >
      <div
        style={{
          display: 'flex',
          padding: '0.25em 0.5em',
          gap: '0.5em',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {childArray}
      </div>
    </div>
  );
};

export default Settings;
