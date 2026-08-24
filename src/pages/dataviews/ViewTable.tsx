import KeyboardTable from '@widgets/tables/KeyboardTable';
import LanguageTable from '@widgets/tables/LanguageTable';
import LocaleTable from '@widgets/tables/LocaleTable';
import OrganizationTable from '@widgets/tables/OrganizationTable';
import TableOfAllCensuses from '@widgets/tables/TableOfAllCensuses';
import TerritoryTable from '@widgets/tables/TerritoryTable';
import VariantTable from '@widgets/tables/VariantTable';
import WritingSystemTable from '@widgets/tables/WritingSystemTable';

import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

function ViewTable() {
  const { entityType } = usePageParams();

  switch (entityType) {
    case EntityType.Census:
      return <TableOfAllCensuses />;
    case EntityType.Language:
      return <LanguageTable />;
    case EntityType.Locale:
      return <LocaleTable />;
    case EntityType.Territory:
      return <TerritoryTable />;
    case EntityType.WritingSystem:
      return <WritingSystemTable />;
    case EntityType.Variant:
      return <VariantTable />;
    case EntityType.Keyboard:
      return <KeyboardTable />;
    case EntityType.Org:
      return <OrganizationTable />;
  }
}

export default ViewTable;
