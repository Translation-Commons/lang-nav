import React, { useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@shared/ui/resizable';

const DataPageBody = React.lazy(() => import('./DataPageBody'));
const FilterPanel = React.lazy(() => import('@widgets/controls/FilterPanel'));
const EntityDetailsDrawer = React.lazy(() => import('@widgets/details/ui/EntityDetailsDrawer'));

const DataPage: React.FC = () => {
  const sidebarRef = usePanelRef();
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const openSidebar = () => sidebarRef.current?.expand();
  const closeSidebar = () => sidebarRef.current?.collapse();

  /* Many data components have more lines of code so they are loaded lazily */
  return (
    <ContainErrorsAndSuspense>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          defaultSize="20%"
          collapsible
          collapsedSize="0%"
          minSize="10%"
          panelRef={sidebarRef}
          onResize={({ asPercentage }) => setSidebarIsOpen(asPercentage > 0)}
        >
          <FilterPanel closeSidebar={closeSidebar} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <DataPageBody sidebarIsOpen={sidebarIsOpen} openSidebar={openSidebar} />
        </ResizablePanel>
      </ResizablePanelGroup>
      <EntityDetailsDrawer />
    </ContainErrorsAndSuspense>
  );
};

export default DataPage;
