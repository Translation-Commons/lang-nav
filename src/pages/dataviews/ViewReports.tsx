import React, { useMemo } from 'react';

import NavTabs from '@widgets/controls/NavTabs';
import Report, { ReportLabels } from '@widgets/reports/Report';
import ReportID, { getReportIDsForEntityType } from '@widgets/reports/ReportID';

import usePageParams from '@features/params/usePageParams';

/**
 * A page that shows tips about problems in the data that may need to be addressed.
 * It may also show metrics about the data we have too.
 */
const ViewReports: React.FC = () => {
  const { objectType } = usePageParams();
  const reportIDs = useMemo(
    () => [ReportID.EntitiesMissingFields, ...getReportIDsForEntityType(objectType)],
    [objectType],
  );

  return (
    <div style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <NavTabs
        options={reportIDs.map((reportID) => ({
          urlParams: {},
          label: ReportLabels[reportID],
        }))}
      />
      {reportIDs.map((reportID) => (
        <Report reportID={reportID} key={reportID} />
      ))}
    </div>
  );
};

export default ViewReports;
