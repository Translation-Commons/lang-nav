import { HoverCardProvider } from './generic/HoverCardContext';
import PageFooter from './pages/PageFooter';
import PageNavBar from './pages/PageNavBar';
import PageRoutes from './pages/PageRoutes';

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
