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
          <PageNavBar />
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <SidePanel />
            <main style={{ padding: '1em', flex: 1, overflow: 'auto', width: '100%' }}>
              <SearchBar />
              <div
                style={{
                  maxWidth: '1280px',
                  margin: '0 auto',
                  padding: '1rem 2rem',
                  textAlign: 'center',
                }}
              >
                <MainViews />
              </div>
            </main>
          </div>
          <ViewModal />
          <Footer />
        </HoverCardProvider>
      </DataProvider>
    </PageParamsProvider>
  );
}

export default App;
