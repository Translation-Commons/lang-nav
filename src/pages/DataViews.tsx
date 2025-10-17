import ObjectDetailsPage from '@features/details/ObjectDetailsPage';
import { ObjectType, View } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';
import ViewReports from '@features/reports/ViewReports';

import CensusCardList from '@entities/census/CensusCardList';
import { CensusHierarchy } from '@entities/census/CensusHierarchy';
import TableOfAllCensuses from '@entities/census/TableOfAllCensuses';
import LanguageCardList from '@entities/language/LanguageCardList';
import { LanguageHierarchy } from '@entities/language/LanguageHierarchy';
import LanguageTable from '@entities/language/LanguageTable';
import LocaleCardList from '@entities/locale/LocaleCardList';
import { LocaleHierarchy } from '@entities/locale/LocaleHierarchy';
import LocaleTable from '@entities/locale/LocaleTable';
import TerritoryCardList from '@entities/territory/TerritoryCardList';
import { TerritoryHierarchy } from '@entities/territory/TerritoryHierarchy';
import TerritoryTable from '@entities/territory/TerritoryTable';
import VariantTagCardList from '@entities/varianttag/VariantTagCardList';
import { VariantTagHierarchy } from '@entities/varianttag/VariantTagHierarchy';
import VariantTagTable from '@entities/varianttag/VariantTagTable';
import WritingSystemCardList from '@entities/writingsystem/WritingSystemCardList';
import { WritingSystemHierarchy } from '@entities/writingsystem/WritingSystemHierarchy';
import WritingSystemTable from '@entities/writingsystem/WritingSystemTable';

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
        case ObjectType.VariantTag:
          return <VariantTagCardList />;
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
        case ObjectType.VariantTag:
          return <VariantTagHierarchy />;
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
        case ObjectType.VariantTag:
          return <VariantTagTable />;
      }
    // eslint-disable-next-line no-fallthrough
    case View.Reports:
      return <ViewReports />;
  }
}

export default MainViews;
