import React, { PropsWithChildren, useMemo, useState } from 'react';

import { AxisScale } from '@features/transforms/scales/AxisScale';

type DataVizParams = {
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  scale: {};
  colorScale?: AxisScale;
  xScale?: AxisScale;
  yScale?: AxisScale;
  setColorScale?: (s: AxisScale) => void;
  setXScale?: (s: AxisScale) => void;
  setYScale?: (s: AxisScale) => void;
};

const DataVizParamsContext = React.createContext<DataVizParams | undefined>(undefined);

type ProviderProps = PropsWithChildren<{
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
}>;

/**
 * These parameters control the state of the data visualization page. They do not persist across page reloads.
 * major parameters should be in the PageParamsProvider instead.
 *
 * * The filter panel is open and providing a function to toggle it.
 * * More to come
 */
const DataVizParamsProvider: React.FC<ProviderProps> = ({
  children,
  isFilterPanelOpen,
  toggleFilterPanel,
}) => {
  const [colorScale, setColorScale] = useState<AxisScale | undefined>(undefined);
  const [xScale, setXScale] = useState<AxisScale | undefined>(undefined);
  const [yScale, setYScale] = useState<AxisScale | undefined>(undefined);

  const providerValue: DataVizParams = useMemo(
    () => ({
      isFilterPanelOpen,
      toggleFilterPanel,
      colorScale,
      xScale,
      yScale,
      setColorScale,
      setXScale,
      setYScale,
    }),
    [
      isFilterPanelOpen,
      toggleFilterPanel,
      colorScale,
      setColorScale,
      xScale,
      yScale,
      setXScale,
      setYScale,
    ],
  );

  return (
    <DataVizParamsContext.Provider value={providerValue}>{children}</DataVizParamsContext.Provider>
  );
};

export const useDataVizParams = (): DataVizParams => {
  const context = React.useContext(DataVizParamsContext);
  if (context) return context;
  return {
    isFilterPanelOpen: false,
    toggleFilterPanel: () => {},
  };
};

export default DataVizParamsProvider;
