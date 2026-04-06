import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import DataPage from '@pages/DataPage';
import AboutPage from '@pages/docs/AboutPage';
import CodeStylePage from '@pages/docs/CodeStylePage';
import DataCoveragePage from '@pages/docs/DataCoveragePage';
import DataSourcesPage from '@pages/docs/DataSources';
import PrivacyPolicyPage from '@pages/docs/PrivacyPolicyPage';
import TeamPage from '@pages/docs/TeamPage';
import TermsOfUsePage from '@pages/docs/TermsOfUsePage';
import IntroPage from '@pages/IntroPage';
import LuckySearchPage from '@pages/LuckySearchPage';

export default function PageRoutes() {
  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/" element={<Navigate to={LangNavPageName.Intro} replace />} />
        <Route path={LangNavPageName.Intro} element={<IntroPage />} />
        <Route path={LangNavPageName.Data} element={<DataPage />} />
        <Route path={LangNavPageName.Lucky} element={<LuckySearchPage />} />

        <Route path={LangNavPageName.About} element={<AboutPage />} />
        <Route path={LangNavPageName.Team} element={<TeamPage />} />
        <Route path={LangNavPageName.PrivacyPolicy} element={<PrivacyPolicyPage />} />
        <Route path={LangNavPageName.TermsOfUse} element={<TermsOfUsePage />} />
        <Route path={LangNavPageName.CodeStyle} element={<CodeStylePage />} />
        <Route path={LangNavPageName.DataCoverage} element={<DataCoveragePage />} />
        <Route path={LangNavPageName.DataSources} element={<DataSourcesPage />} />
      </Routes>
    </>
  );
}

const RemoveTrailingSlash = ({ ...rest }) => {
  const location = useLocation();

  // If the last character of the url is '/'
  if (location.pathname.match('/.*/$')) {
    return (
      <Navigate
        replace
        {...rest}
        to={{
          pathname: location.pathname.replace(/\/+$/, ''),
          search: location.search,
        }}
      />
    );
  } else return null;
};

export enum LangNavPageName {
  Intro = 'intro',
  Data = 'data',
  Lucky = 'lucky',

  About = 'about',
  Team = 'team',
  TermsOfUse = 'terms-of-use',
  PrivacyPolicy = 'privacy-policy',
  CodeStyle = 'code-style',
  DataCoverage = 'data-coverage',
  DataSources = 'data-sources',
}
