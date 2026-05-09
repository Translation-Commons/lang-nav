import KeyboardTable from '@widgets/tables/KeyboardTable';
import LanguageTable from '@widgets/tables/LanguageTable';
import LocaleTable from '@widgets/tables/LocaleTable';
import OrganizationTable from '@widgets/tables/OrganizationTable';
import TableOfAllCensuses from '@widgets/tables/TableOfAllCensuses';
import TerritoryTable from '@widgets/tables/TerritoryTable';
import VariantTable from '@widgets/tables/VariantTable';
import WritingSystemTable from '@widgets/tables/WritingSystemTable';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

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
    case ObjectType.Variant:
      return <VariantTable />;
    case ObjectType.Keyboard:
      return <KeyboardTable />;
    case ObjectType.Org:
      return <OrganizationTable />;
  }
}

export default ViewTable;
