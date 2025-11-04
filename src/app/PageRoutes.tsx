import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import AboutPage from '@pages/AboutPage';
import DataPage from '@pages/DataPage';
import IntroPage from '@pages/IntroPage';

export default function PageRoutes() {
  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/" element={<Navigate to={LangNavPageName.Intro} replace />} />
        <Route path={LangNavPageName.Intro} element={<IntroPage />} />
        <Route path={LangNavPageName.Data} element={<DataPage />} />
        {/* <Route path={LangNavPageName.Details} element={<DetailsPage />} /> */}
        <Route path={LangNavPageName.About} element={<AboutPage />} />
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

// TODO
export enum LangNavPageName {
  Intro = 'intro',
  Data = 'data',
  // Details = 'details',
  About = 'about',
}
