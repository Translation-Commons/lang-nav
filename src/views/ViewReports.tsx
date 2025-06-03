import React from 'react';

import { usePageParams } from '../controls/PageParamsContext';

import DubiousLanguages from './language/DubiousLanguages';
import LanguagesWithIdenticalNames from './language/LanguagesWithIdenticalNames';
import PotentialLocales from './locale/PotentialLocales';

/**
 * A page that shows tips about problems in the data that may need to be addressed.
 * It may also show metrics about the data we have too.
 */
const ViewReports: React.FC = () => {
  const { objectType } = usePageParams();

  let reports: React.ReactNode = 'There are no reports for this object type.';
  switch (objectType) {
    case 'Locale':
      reports = <PotentialLocales />;
      break;
    case 'Language':
      reports = (
        <>
          <DubiousLanguages />
          <LanguagesWithIdenticalNames key="1" />
        </>
      );
      break;
  }

  return <div className="ViewReports">{reports}</div>;
};

export default ViewReports;
