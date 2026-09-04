import React from 'react';

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
    <div className="mt-4 flex flex-col gap-2">
      <div>
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
      </div>
      <div className="flex gap-2">
        <FieldFocusSelector />
      </div>
    </div>
  );
}
