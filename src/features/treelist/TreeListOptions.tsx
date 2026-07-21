import React from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import FieldFocusSelector from '@features/transforms/fields/FieldFocusSelector';

import { Checkbox } from '@shared/ui/checkbox';
import { Label } from '@shared/ui/label';

interface TreeListOptions {
  allExpanded: boolean;
  showInfoButton: boolean;
  showObjectIDs: boolean;
  setAllExpanded: (value: boolean) => void;
  setShowInfoButton: (value: boolean) => void;
  setShowObjectIDs: (value: boolean) => void;
}
const TreeListOptionsContext = React.createContext<TreeListOptions>({
  allExpanded: false,
  showInfoButton: true,
  showObjectIDs: false,
  setAllExpanded: () => {},
  setShowInfoButton: () => {},
  setShowObjectIDs: () => {},
});

export const TreeListOptionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [allExpanded, setAllExpanded] = React.useState(false);
  const [showInfoButton, setShowInfoButton] = React.useState(true);
  const [showObjectIDs, setShowObjectIDs] = React.useState(false);

  const value = {
    allExpanded,
    showInfoButton,
    showObjectIDs,
    setAllExpanded,
    setShowInfoButton,
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
    showObjectIDs,
    setAllExpanded,
    setShowInfoButton,
    setShowObjectIDs,
  } = useTreeListOptionsContext();

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        <Label className="cursor-pointer font-normal">
          <Checkbox checked={allExpanded} onCheckedChange={(v) => setAllExpanded(v === true)} />
          Expand All
        </Label>
        <Label className="cursor-pointer font-normal">
          <Checkbox
            checked={showInfoButton}
            onCheckedChange={(v) => setShowInfoButton(v === true)}
          />
          Show Info Button
        </Label>
        <Label className="cursor-pointer font-normal">
          <Checkbox checked={showObjectIDs} onCheckedChange={(v) => setShowObjectIDs(v === true)} />
          Show Object IDs
        </Label>

        <FieldFocusSelector />
      </SelectorDisplayProvider>
    </div>
  );
}
