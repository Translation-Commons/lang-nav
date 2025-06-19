import { usePageParams } from '../controls/PageParamsContext';
import { ObjectType, View } from '../types/PageParamTypes';

import AboutPage from './AboutPage';
import CensusCardList from './census/CensusCardList';
import { CensusHierarchy } from './census/CensusHierarchy';
import TableOfAllCensuses from './census/TableOfAllCensuses';
import ObjectDetailsPage from './common/ObjectDetailsPage';
import LanguageCardList from './language/LanguageCardList';
import { LanguageHierarchy } from './language/LanguageHierarchy';
import LanguageTable from './language/LanguageTable';
import LocaleCardList from './locale/LocaleCardList';
import { LocaleHierarchy } from './locale/LocaleHierarchy';
import LocaleTable from './locale/LocaleTable';
import TerritoryCardList from './territory/TerritoryCardList';
import { TerritoryHierarchy } from './territory/TerritoryHierarchy';
import TerritoryTable from './territory/TerritoryTable';
import ViewReports from './ViewReports';
import WritingSystemCardList from './writingsystem/WritingSystemCardList';
import { WritingSystemHierarchy } from './writingsystem/WritingSystemHierarchy';
import WritingSystemTable from './writingsystem/WritingSystemTable';
import './styles.css';

function MainViews() {
  const { view, objectType } = usePageParams();

  switch (view) {
    case View.CardList:
      switch (objectType) {
        case ObjectType.Census:
          return <CensusCardList />;
        case ObjectType.Language:
          return <LanguageCardList />;
        case ObjectType.Locale:
          return <LocaleCardList />;
        case ObjectType.Territory:
          return <TerritoryCardList />;
        case ObjectType.WritingSystem:
          return <WritingSystemCardList />;
      }
    // eslint-disable-next-line no-fallthrough
    case View.Details:
      return <ObjectDetailsPage />;
    case View.Hierarchy:
      switch (objectType) {
        case ObjectType.Census:
          return <CensusHierarchy />;
        case ObjectType.Language:
          return <LanguageHierarchy />;
        case ObjectType.Locale:
          return <LocaleHierarchy />;
        case ObjectType.Territory:
          return <TerritoryHierarchy />;
        case ObjectType.WritingSystem:
          return <WritingSystemHierarchy />;
      }
    // eslint-disable-next-line no-fallthrough
    case View.Table:
      switch (objectType) {
        case ObjectType.Census:
          return <TableOfAllCensuses />;
        case ObjectType.Language:
          return <LanguageTable />;
        case ObjectType.Locale:
          return <LocaleTable />;
        case ObjectType.Territory:
          return <TerritoryTable />;
        case ObjectType.WritingSystem:
          return <WritingSystemTable />;
      }
    // eslint-disable-next-line no-fallthrough
    case View.Reports:
      return <ViewReports />;
    case View.About:
      return <AboutPage />;
  }
}

export default MainViews;
