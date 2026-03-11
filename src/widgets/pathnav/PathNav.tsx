import { SlashIcon } from 'lucide-react';
import React from 'react';

import { View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import FilterPath from '@features/transforms/filtering/FilterPath';

const PathNav: React.FC = () => {
  return (
    <PathContainer>
      <SlashIcon size="1em" />
      <ViewSelector />
      <FilterPath />
    </PathContainer>
  );
};

const ViewSelector: React.FC = () => {
  const { view, updatePageParams } = usePageParams();

  return (
    <Selector
      options={Object.values(View)}
      onChange={(view: View) => updatePageParams({ view })}
      selected={view}
      getOptionLabel={(view) =>
        [View.Map, View.Reports].includes(view) ? (
          <>
            {view} <em>β</em>
          </>
        ) : (
          view
        )
      }
    />
  );
};

export const PathContainer: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap', ...style }}
    >
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        {children}
      </SelectorDisplayProvider>
    </div>
  );
};

export default PathNav;
