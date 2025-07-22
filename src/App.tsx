import FilterPanel from './controls/FilterPanel';
import PageLayout from './controls/PageLayout';
import PageNavBar from './controls/PageNavBar';
import { PageParamsProvider } from './controls/PageParamsContext';
import SearchBar from './controls/selectors/SearchBar';
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
          <PageLayout navbar={<PageNavBar />} sidebar={<FilterPanel />} footer={<Footer />}>
            <span className="Options">
              <SearchBar />
            </span>
            <div className="Body">
              <MainViews />
            </div>
          </PageLayout>
          <ViewModal />
        </HoverCardProvider>
      </DataProvider>
    </PageParamsProvider>
  );
}

export default App;
