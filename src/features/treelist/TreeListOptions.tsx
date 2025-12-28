import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { ColorBy } from '@features/transforms/coloring/ColorTypes';
import {
  getFieldsForSorting,
  intersectAllowedWithObjectType,
} from '@features/transforms/fields/FieldApplicability';

interface TreeListOptions {
  allExpanded: boolean;
  showInfoButton: boolean;
  showData: ColorBy;
  showObjectIDs: boolean;
  setAllExpanded: (value: boolean) => void;
  setShowInfoButton: (value: boolean) => void;
  setShowData: (value: ColorBy) => void;
  setShowObjectIDs: (value: boolean) => void;
}
const TreeListOptionsContext = React.createContext<TreeListOptions>({
  allExpanded: false,
  showInfoButton: true,
  showData: 'None',
  showObjectIDs: false,
  setAllExpanded: () => {},
  setShowInfoButton: () => {},
  setShowData: () => {},
  setShowObjectIDs: () => {},
});

export const TreeListOptionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [allExpanded, setAllExpanded] = React.useState(false);
  const [showInfoButton, setShowInfoButton] = React.useState(true);
  const [showData, setShowData] = React.useState<ColorBy>('None');
  const [showObjectIDs, setShowObjectIDs] = React.useState(false);

  const value = {
    allExpanded,
    showInfoButton,
    showData,
    showObjectIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowData,
    setShowObjectIDs,
  };

  return (
    <TreeListOptionsContext.Provider value={value}>{children}</TreeListOptionsContext.Provider>
  );
};

export function useTreeListOptionsContext(): TreeListOptions {
  const context = React.useContext(TreeListOptionsContext);
  return context;
}

export function TreeListOptionsSelectors() {
  const {
    allExpanded,
    showInfoButton,
    showData,
    showObjectIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowData,
    setShowObjectIDs,
  } = useTreeListOptionsContext();

  return (
    <div
      style={{
        marginTop: '1em',
        display: 'flex',
        gap: '0.5em',
        flexWrap: 'wrap',
      }}
    >
      <label>
        <input
          type="checkbox"
          checked={allExpanded}
          onChange={(e) => setAllExpanded(e.target.checked)}
        />
        Expand All
      </label>
      <label>
        <input
          type="checkbox"
          checked={showInfoButton}
          onChange={(e) => setShowInfoButton(e.target.checked)}
        />
        Show Info Button
      </label>
      <label>
        <input
          type="checkbox"
          checked={showObjectIDs}
          onChange={(e) => setShowObjectIDs(e.target.checked)}
        />
        Show Object IDs
      </label>

      <ShowDataSelector showData={showData} setShowData={setShowData} />
    </div>
  );
}

const ShowDataSelector: React.FC<{
  showData: ColorBy;
  setShowData: (value: ColorBy) => void;
}> = ({ showData, setShowData }) => {
  const { objectType } = usePageParams();
  const applicableSortBys: ColorBy[] = [
    'None',
    ...intersectAllowedWithObjectType(getFieldsForSorting(), objectType),
  ];

  return (
    <Selector<ColorBy>
      selectorLabel="Show Data"
      selectorDescription="Choose data to show to the right side of the items."
      options={applicableFields}
      onChange={(sortBy) => setShowData(sortBy)}
      selected={showData}
      display={SelectorDisplay.InlineDropdown}
    />
  );
};
