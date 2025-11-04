import CensusCardList from '@widgets/cardlists/CensusCardList';
import LanguageCardList from '@widgets/cardlists/LanguageCardList';
import LocaleCardList from '@widgets/cardlists/LocaleCardList';
import TerritoryCardList from '@widgets/cardlists/TerritoryCardList';
import VariantTagCardList from '@widgets/cardlists/VariantTagCardList';
import WritingSystemCardList from '@widgets/cardlists/WritingSystemCardList';

import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import './styles.css';

function ViewCardList() {
  const { objectType } = usePageParams();

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
}

export default ViewCardList;
