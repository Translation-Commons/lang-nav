import { Routes, Route, Navigate } from 'react-router-dom';

import AboutPage from './AboutPage';
import DataPage from './DataPage';

export default function PageRoutes() {
  return (
    <Routes>
      <Route path="*" element={<div>Page not found</div>} />
      <Route path="/" element={<Navigate to="/data" replace />} />
      {/* <Route path={LangNavPageName.Intro} element={<IntroPage />} /> */}
      <Route path={LangNavPageName.Data} element={<DataPage />} />
      {/* <Route path={LangNavPageName.Details} element={<DetailsPage />} /> */}
      <Route path={LangNavPageName.About} element={<AboutPage />} />
    </Routes>
  );
}

// TODO
export enum LangNavPageName {
  // Intro = 'intro',
  Data = 'data',
  // Details = 'details',
  About = 'about',
}
