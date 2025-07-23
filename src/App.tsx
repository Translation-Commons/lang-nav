import PageNavBar from './controls/PageNavBar';
import { PageParamsProvider } from './controls/PageParamsContext';
import SearchBar from './controls/selectors/SearchBar';
import SidePanel from './controls/SidePanel';
import { DataProvider } from './data/DataContext';
import Footer from './Footer';
import { HoverCardProvider } from './generic/HoverCardContext';
import MainViews from './views/MainViews';
import ViewModal from './views/ViewModal';

function App() {
  return (
    <PageParamsProvider>
      <DataProvider>
        <HoverCardProvider>
          <div>
            <PageNavBar />
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <SidePanel />
              <main style={{ flex: 1, padding: '1em', overflow: 'auto' }}>
                <span className="Options">
                  <SearchBar />
                </span>
                <div className="Body">
                  <MainViews />
                </div>
              </main>
            </div>
            <Footer />
          </div>
          <ViewModal />
        </HoverCardProvider>
      </DataProvider>
    </PageParamsProvider>
  );
}

export default App;
