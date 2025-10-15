import TableOfCountriesWithCensuses from '@entities/census/TableOfCountriesWithCensuses';
import DubiousLanguages from '@entities/language/reports/DubiousLanguages';
import LanguagesLargestDescendant from '@entities/language/reports/LanguagesLargestDescendant';
import LanguagesWithIdenticalNames from '@entities/language/reports/LanguagesWithIdenticalNames';
import PotentialLocales from '@entities/locale/PotentialLocales';
import { usePageParams } from '@widgets/PageParamsProvider';
import { ObjectType } from '@widgets/PageParamTypes';
import React from 'react';

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
