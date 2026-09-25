import React, { useMemo } from 'react';

import getReportIDsForEntityType from '@widgets/reports/getReportIDsForEntityType';
import Report from '@widgets/reports/Report';
import ReportID from '@widgets/reports/ReportID';
import ReportSelector from '@widgets/reports/ReportSelector';

import usePageParams from '@features/params/usePageParams';

/**
 * A page that shows tips about problems in the data that may need to be addressed.
 * It may also show metrics about the data we have too.
 */
const ViewReports: React.FC = () => {
  const { entType, reportID } = usePageParams();
  const reportIDs = useMemo(
    () => [ReportID.EntitiesMissingFields, ...getReportIDsForEntityType(entType)],
    [entType],
  );
  const currentReportID = useMemo(() => {
    if (reportID && reportIDs.includes(reportID)) return reportID;
    return ReportID.None;
  }, [reportID, reportIDs]);

  return (
    <div data-testid="reports-view" className="text-left">
      {currentReportID ? (
        <Report reportID={currentReportID} />
      ) : (
        <ReportSelector variant="Buttons" />
      )}
    </div>
  );
};

export default ViewReports;
