import usePageParams from '@features/params/usePageParams';

import TableOfAllCensuses from '@entities/census/TableOfAllCensuses';
import KeyboardTable from '@entities/keyboard/KeyboardTable';
import LanguageTable from '@entities/language/LanguageTable';
import LocaleTable from '@entities/locale/LocaleTable';
import OrganizationTable from '@entities/org/OrganizationTable';
import OrthographyTable from '@entities/orthography/OrthographyTable';
import TechnologyTable from '@entities/tech/TechnologyTable';
import TerritoryTable from '@entities/territory/TerritoryTable';
import { EntityType } from '@entities/types/EntityTypes';
import VariantTable from '@entities/variant/VariantTable';
import WritingSystemTable from '@entities/writingsystem/WritingSystemTable';

function ViewTable() {
  const { entType } = usePageParams();

  switch (entType) {
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
    case EntityType.Technology:
      return <TechnologyTable />;
    case EntityType.Orthography:
      return <OrthographyTable />;
  }
}

export default ViewTable;
