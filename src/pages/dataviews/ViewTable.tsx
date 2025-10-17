import LanguageTable from '@widgets/tables/LanguageTable';
import LocaleTable from '@widgets/tables/LocaleTable';
import TableOfAllCensuses from '@widgets/tables/TableOfAllCensuses';
import TerritoryTable from '@widgets/tables/TerritoryTable';
import VariantTagTable from '@widgets/tables/VariantTagTable';
import WritingSystemTable from '@widgets/tables/WritingSystemTable';

import { ObjectType } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';

import './styles.css';

function ViewTable() {
  const { objectType } = usePageParams();

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
}

export default ViewTable;
