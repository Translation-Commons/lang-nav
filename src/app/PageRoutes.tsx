import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AboutPage from '@pages/AboutPage';
import DataPage from '@pages/DataPage';
import DocsPage from '@pages/DocsPage';
import IntroPage from '@pages/IntroPage';
import LuckySearchPage from '@pages/LuckySearchPage';
import PrivacyPolicyPage from '@pages/PrivacyPolicyPage';

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

        <Route path={LangNavPageName.Docs} element={<DocsPage />} />
        <Route path={LangNavPageName.About} element={<AboutPage />} />
        <Route path={LangNavPageName.PrivacyPolicy} element={<PrivacyPolicyPage />} />
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

  Docs = 'docs',
  About = 'about',
  PrivacyPolicy = 'privacy-policy',
}
