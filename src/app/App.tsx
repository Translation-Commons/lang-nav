import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import HoverCardProvider from '@features/layers/hovercard/HoverCardProvider';

import { initAmplitude, trackPageView } from '@shared/lib/amplitude';

import PageRoutes from './PageRoutes';

import './index.css';

function AmplitudeTracker() {
  const location = useLocation();
  const lastPageRef = useRef('');

  useEffect(() => {
    initAmplitude();

    const page = `${location.pathname}${location.search}`;

    if (lastPageRef.current === page) return;

    lastPageRef.current = page;
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <HoverCardProvider>
      <AmplitudeTracker />
      <PageNavBar />
      <PageRoutes />
      <PageFooter />
    </HoverCardProvider>
  );
}

export default App;
