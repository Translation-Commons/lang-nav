import React from 'react';

import DubiousLanguages from '@widgets/reports/DubiousLanguages';
import LanguagePathsReport from '@widgets/reports/LanguagePathsReport';
import LanguagesLargestDescendant from '@widgets/reports/LanguagesLargestDescendant';
import LanguagesMissingWritingSystems from '@widgets/reports/LanguagesMissingWritingSystems';
import LanguagesWithIdenticalNames from '@widgets/reports/LanguagesWithIdenticalNames';
import LocaleCitationCounts from '@widgets/reports/LocaleCitationCounts';
import PotentialLocales from '@widgets/reports/PotentialLocales';
import ReportEntityUnknownFields from '@widgets/reports/ReportEntityUnknownFields';
import TableOfCountriesWithCensuses from '@widgets/reports/TableOfCountriesWithCensuses';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

/**
 * A page that shows tips about problems in the data that may need to be addressed.
 * It may also show metrics about the data we have too.
 */
const ViewReports: React.FC = () => {
  const { objectType } = usePageParams();

  return (
    <div style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <ReportEntityUnknownFields />
      <ReportsForObjectType objectType={objectType} />
    </div>
  );
};

const ReportsForObjectType: React.FC<{ objectType: ObjectType }> = ({ objectType }) => {
  switch (objectType) {
    case ObjectType.Locale:
      // For locales we show both a high‑level citation summary and potential locales to add.
      return (
        <>
          <LocaleCitationCounts />
          <PotentialLocales />
        </>
      );
    case ObjectType.Language:
      return (
        <>
          <DubiousLanguages />
          <LanguagesWithIdenticalNames />
          <LanguagesLargestDescendant />
          <LanguagePathsReport />
        </>
      );
    case ObjectType.WritingSystem:
      return (
        <>
          <LanguagesMissingWritingSystems />
        </>
      );
    case ObjectType.Census:
      return <TableOfCountriesWithCensuses />;
    case ObjectType.Territory:
    case ObjectType.VariantTag:
      return <></>;
  }
};

export default ViewReports;
