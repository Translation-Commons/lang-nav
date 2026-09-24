import { WrenchIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParamNavigation from '@features/params/usePageParamNavigation';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import getReportIDsForEntityType from './getReportIDsForEntityType';
import ReportID from './ReportID';
import ReportLabels from './ReportLabels';

type Props = {
  variant: 'NavTabs' | 'Buttons' | 'Dropdown';
};

const ReportSelector: React.FC<Props> = ({ variant }) => {
  const { view, entType, reportID } = usePageParams();
  const updatePage = usePageParamNavigation({ keepOldParams: true });
  const reportIDs = useMemo(
    () => [ReportID.EntitiesMissingFields, ...getReportIDsForEntityType(entType)],
    [entType],
  );
  const currentReportID = useMemo(() => {
    if (reportID && reportIDs.includes(reportID)) return reportID;
    return undefined;
  }, [reportID, reportIDs]);

  if (view !== View.Reports) return null;

  if (variant === 'NavTabs') {
    return null;
  }
  if (variant === 'Dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button className="cursor-pointer" variant="outline" role="dropdown">
              <WrenchIcon />
              <div className="truncate text-ellipsis">
                {currentReportID ? ReportLabels[currentReportID] : 'Select a report'}
              </div>
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={currentReportID}
            onValueChange={(value) => updatePage({ reportID: value })}
          >
            {reportIDs.map((option) => (
              <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer">
                {ReportLabels[option]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <div className="flex flex-col gap-4 items-center">
      <div>
        Choose a tool to evaluate gaps and quirks in our data on {getEntityTypeLabelPlural(entType)}
        :
      </div>
      <div className="flex flex-col gap-2">
        {reportIDs.map((reportID) => (
          <Button key={reportID} variant="secondary" onClick={() => updatePage({ reportID })}>
            {ReportLabels[reportID]}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ReportSelector;
