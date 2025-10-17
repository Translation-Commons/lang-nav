import { HoverCardProvider } from '@widgets/HoverCardContext';
import PageFooter from '@widgets/PageFooter';
import PageNavBar from '@widgets/PageNavBar';

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
