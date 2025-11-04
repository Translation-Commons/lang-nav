import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

import HoverCardProvider from '@features/hovercard/HoverCardProvider';

import PageRoutes from './PageRoutes';

import './index.css';

function App() {
  return (
    <HoverCardProvider>
      <PageNavBar />
      <PageRoutes />
      <PageFooter />
    </HoverCardProvider>
  );
}

export default App;
