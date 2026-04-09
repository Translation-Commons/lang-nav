import React from 'react';

import Loading from '@widgets/Loading';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import ReportID from './ReportID';

const LocaleIndigeneityReport = React.lazy(
  () => import('@entities/locale/localstatus/LocaleIndigeneityReport'),
);
const ReportCensusCountries = React.lazy(() => import('./ReportCensusCountries'));
const ReportEntitiesMissingFields = React.lazy(() => import('./ReportEntitiesMissingFields'));
const ReportLanguageDescendents = React.lazy(() => import('./ReportLanguageDescendents'));
const ReportLanguagePaths = React.lazy(() => import('./ReportLanguagePaths'));
const ReportLanguagesDubious = React.lazy(() => import('./ReportLanguagesDubious'));
const ReportLanguagesWithAmbiguousNames = React.lazy(
  () => import('./ReportLanguagesWithAmbiguousNames'),
);
const ReportLocaleCitationCompleteness = React.lazy(
  () => import('./ReportLocaleCitationCompleteness'),
);
const ReportLocalesPotential = React.lazy(() => import('./ReportLocalesPotential'));
const ReportWritingSystemsLanguagesWithout = React.lazy(
  () => import('./ReportWritingSystemsLanguagesWithout'),
);
const ReportVariantsAnnotationTool = React.lazy(() => import('./ReportVariantsAnnotationTool'));

const Report: React.FC<{ reportID: ReportID }> = ({ reportID }) => {
  return (
    <React.Suspense fallback={<Loading />}>
      <SpecificReport reportID={reportID} />
    </React.Suspense>
  );
};

const SpecificReport: React.FC<{ reportID: ReportID }> = ({ reportID }) => {
  switch (reportID) {
    case ReportID.EntitiesMissingFields:
      return <ReportEntitiesMissingFields />;
    case ReportID.CensusCountries:
      return <ReportCensusCountries />;
    case ReportID.LanguagePaths:
      return <ReportLanguagePaths />;
    case ReportID.LanguageDescendents:
      return <ReportLanguageDescendents />;
    case ReportID.LanguagesWithAmbiguousNames:
      return <ReportLanguagesWithAmbiguousNames />;
    case ReportID.LanguagesDubious:
      return <ReportLanguagesDubious />;
    case ReportID.LocaleCitationCompleteness:
      return <ReportLocaleCitationCompleteness />;
    case ReportID.WritingSystemsLanguagesWithout:
      return <ReportWritingSystemsLanguagesWithout />;
    case ReportID.LocaleIndigeneity:
      return <LocaleIndigeneityReport />;
    case ReportID.LocalesPotential:
      return <ReportLocalesPotential />;
    case ReportID.VariantsAnnotationTool:
      return <ReportVariantsAnnotationTool />;
    default:
      enforceExhaustiveSwitch(reportID);
  }
};

export default Report;
