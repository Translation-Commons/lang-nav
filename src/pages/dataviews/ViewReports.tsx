import React, { useMemo } from 'react';

import NavTabs from '@widgets/controls/NavTabs';
import getReportIDsForEntityType from '@widgets/reports/getReportIDsForEntityType';
import Report from '@widgets/reports/Report';
import ReportID from '@widgets/reports/ReportID';
import ReportLabels from '@widgets/reports/ReportLabels';

import usePageParams from '@features/params/usePageParams';

/**
 * A page that shows tips about problems in the data that may need to be addressed.
 * It may also show metrics about the data we have too.
 */
const ViewReports: React.FC = () => {
  const { objectType, reportID } = usePageParams();
  const reportIDs = useMemo(
    () => [ReportID.EntitiesMissingFields, ...getReportIDsForEntityType(objectType)],
    [objectType],
  );
  const currentReportID = useMemo(() => {
    if (reportID && reportIDs.includes(reportID)) return reportID;
    return reportIDs[0];
  }, [reportID, reportIDs]);

  return (
    <div style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <NavTabs
        label="Reports:"
        options={reportIDs.map((reportID) => ({
          urlParams: { reportID },
          label: ReportLabels[reportID],
        }))}
      />
      <Report reportID={currentReportID} />
    </div>
  );
};

export default ViewReports;
