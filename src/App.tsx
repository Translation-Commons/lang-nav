import PageNavBar from './controls/PageNavBar';
import { PageParamsProvider } from './controls/PageParamsContext';
import Footer from './Footer';
import { HoverCardProvider } from './generic/HoverCardContext';
import PageContents from './views/PageContents';

function App() {
  return (
    <PageParamsProvider>
      <HoverCardProvider>
        <PageNavBar />
        <PageContents />
        <Footer />
      </HoverCardProvider>
    </PageParamsProvider>
  );
}

export default App;
