import usePageParams from '@features/params/usePageParams';

import { CensusHierarchy } from '@entities/census/CensusHierarchy';
import { LanguageHierarchy } from '@entities/language/relations/LanguageHierarchy';
import { LocaleHierarchy } from '@entities/locale/LocaleHierarchy';
import { OrganizationHierarchy } from '@entities/org/OrganizationHierarchy';
import { TerritoryHierarchy } from '@entities/territory/TerritoryHierarchy';
import { EntityType } from '@entities/types/EntityTypes';
import { VariantHierarchy } from '@entities/variant/VariantHierarchy';
import { WritingSystemHierarchy } from '@entities/writingsystem/WritingSystemHierarchy';

function ViewFamilyTree() {
  const { entType } = usePageParams();

  switch (entType) {
    case EntityType.Census:
      return <CensusHierarchy />;
    case EntityType.Language:
      return <LanguageHierarchy />;
    case EntityType.Locale:
      return <LocaleHierarchy />;
    case EntityType.Territory:
      return <TerritoryHierarchy />;
    case EntityType.WritingSystem:
      return <WritingSystemHierarchy />;
    case EntityType.Variant:
      return <VariantHierarchy />;
    case EntityType.Org:
      return <OrganizationHierarchy />;
    case EntityType.Keyboard:
      return 'Family trees are not defined well for this type';
  }
}

export default ViewFamilyTree;
