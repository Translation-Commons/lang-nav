import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';

interface TreeListOptions {
  allExpanded: boolean;
  showInfoButton: boolean;
  showEntIDs: boolean;
  setAllExpanded: (value: boolean) => void;
  setShowInfoButton: (value: boolean) => void;
  setShowEntIDs: (value: boolean) => void;
}
const TreeListOptionsContext = React.createContext<TreeListOptions>({
  allExpanded: false,
  showInfoButton: true,
  showEntIDs: false,
  setAllExpanded: () => {},
  setShowInfoButton: () => {},
  setShowEntIDs: () => {},
});

export const TreeListOptionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [allExpanded, setAllExpanded] = React.useState(false);
  const [showInfoButton, setShowInfoButton] = React.useState(true);
  const [showEntIDs, setShowEntIDs] = React.useState(false);

  const value = {
    allExpanded,
    showInfoButton,
    showEntIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowEntIDs,
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
    showEntIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowEntIDs,
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
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
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
            checked={showEntIDs}
            onChange={(e) => setShowEntIDs(e.target.checked)}
          />
          Show Entity IDs
        </label>

        <FieldFocusSelector />
      </SelectorDisplayProvider>
    </div>
  );
}
