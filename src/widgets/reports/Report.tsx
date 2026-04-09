import React from 'react';

import ReportCensusCountries from './ReportCensusCountries';
import ReportEntitiesMissingFields from './ReportEntitiesMissingFields';
import ReportID from './ReportID';
import ReportLanguageDescendents from './ReportLanguageDescendents';
import ReportLanguagesPaths from './ReportLanguagePaths';
import DubiousLanguages from './ReportLanguagesDubious';
import ReportLanguagesWithAmbiguousNames from './ReportLanguagesWithAmbiguousNames';

const Report: React.FC<{ reportID: ReportID }> = ({ reportID }) => {
  switch (reportID) {
    case ReportID.EntitiesMissingFields:
      return <ReportEntitiesMissingFields />;
    case ReportID.CensusCountries:
      return <ReportCensusCountries />;
    case ReportID.LanguagePaths:
      return <ReportLanguagesPaths />;
    case ReportID.LanguageDescendents:
      return <ReportLanguageDescendents />;
    case ReportID.LanguagesWithAmbiguousNames:
      return <ReportLanguagesWithAmbiguousNames />;
    case ReportID.LanguagesDubious:
      return <DubiousLanguages />;
    default:
      return null;
  }
};
//       <LocaleCitationCounts />
//       <PotentialLocales />
//       <LocaleIndigeneityReport />
//     </>
//   );
// case ObjectType.Language:
//   return (
//     <>
//       <DubiousLanguages />
//       <LanguagesWithIdenticalNames />
//       <LanguagesLargestDescendant />
//       <LanguagePathsReport />
//     </>
//   );
// case ObjectType.WritingSystem:
//   return <LanguagesMissingWritingSystems />;
// case ObjectType.Census:
//   return <TableOfCountriesWithCensuses />;
// case ObjectType.Territory:
//   return <></>;
// case ObjectType.Variant:
//   return <VariantAnnotationReport />;

export const ReportLabels: Record<ReportID, string> = {
  [ReportID.CensusCountries]: 'Countries',
  [ReportID.EntitiesMissingFields]: 'Missing Fields',
  [ReportID.LanguageDescendents]: 'Descendents',
  [ReportID.LanguagePaths]: 'Paths',
  [ReportID.LanguagesDubious]: 'Dubious Languages',
  [ReportID.LanguagesWithAmbiguousNames]: 'Ambiguous Names',
  [ReportID.LocalesCitationCompleteness]: 'Citation Completeness',
  [ReportID.LocalesIndigeneity]: 'Indigeneity',
  [ReportID.LocalesPotential]: 'Potential Locales',
  [ReportID.VariantsAnnotationTool]: 'Annotation Tool',
  [ReportID.WritingSystemsLanguagesWithout]: 'WritingSystemsLanguagesWithout',
};

export default Report;
