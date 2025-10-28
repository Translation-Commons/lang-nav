import React from 'react';

import DubiousLanguages from '@widgets/reports/DubiousLanguages';
import LanguagesLargestDescendant from '@widgets/reports/LanguagesLargestDescendant';
import LanguagesWithIdenticalNames from '@widgets/reports/LanguagesWithIdenticalNames';
import PotentialLocales from '@widgets/reports/PotentialLocales';
import TableOfCountriesWithCensuses from '@widgets/reports/TableOfCountriesWithCensuses';

import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

/**
 * A page that shows tips about problems in the data that may need to be addressed.
 * It may also show metrics about the data we have too.
 */
const ViewReports: React.FC = () => {
  const { objectType } = usePageParams();

  return (
    <div style={{ textAlign: 'start' }}>
      <ReportsForObjectType objectType={objectType} />
    </div>
  );
};

const ReportsForObjectType: React.FC<{ objectType: ObjectType }> = ({ objectType }) => {
  switch (objectType) {
    case ObjectType.Locale:
      return <PotentialLocales />;
    case ObjectType.Language:
      return (
        <>
          <DubiousLanguages />
          <LanguagesWithIdenticalNames />
          <LanguagesLargestDescendant />
        </>
      );
    case ObjectType.Census:
      return <TableOfCountriesWithCensuses />;
    case ObjectType.Territory:
    case ObjectType.WritingSystem:
      return <div>There are no reports for this object type.</div>;
  }
};

export default ViewReports;
