import React from 'react';

import Field from '@features/transforms/fields/Field';
import LanguageSourceSelector from '@features/transforms/filtering/selectors/LanguageSourceSelector';

import { LanguageScope } from '@entities/language/LanguageTypes';
import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { LanguageModality } from '@entities/language/writing/LanguageModality';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import EnumButtonsMultiSelect from '@shared/ui/EnumButtonsMultiSelect';

import { getModalityLabel } from '@strings/LanguageModalityStrings';
import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LanguageFamilyFilterSelector from './LanguageFamilyFilterSelector';
import LanguageFilterSelector from './LanguageFilterSelector';
import OrganizationFilterSelector from './OrganizationFilterSelector';
import PopulationFilterSelector from './PopulationFilterSelector';
import SubstringFilterSelector from './SubstringFilterSelector';
import TerritoryFilterSelector from './TerritoryFilterSelector';
import WritingSystemFilterSelector from './WritingSystemFilterSelector';

type Props = { field: Field };

const FilterSelector: React.FC<Props> = ({ field }) => {
  switch (field) {
    case Field.LanguageList:
      return <LanguageFilterSelector />;
    case Field.LanguageFamily:
      return <LanguageFamilyFilterSelector />;
    case Field.TerritoryList:
      return <TerritoryFilterSelector />;
    case Field.WritingSystem:
      return <WritingSystemFilterSelector />;
    case Field.Modality:
      return (
        <EnumButtonsMultiSelect
          paramKey="modalityFilter"
          options={Object.values(LanguageModality).filter((v) => typeof v === 'number')}
          getLabel={(o) => getModalityLabel(o) ?? ''}
        />
      );
    case Field.LanguageScope:
      return (
        <EnumButtonsMultiSelect
          paramKey="languageScopes"
          options={Object.values(LanguageScope).filter((v) => typeof v === 'number')}
          getLabel={(o) => getLanguageScopeLabel(o) ?? ''}
        />
      );
    case Field.TerritoryScope:
      return (
        <EnumButtonsMultiSelect
          paramKey="territoryScopes"
          options={Object.values(TerritoryScope).filter((v) => typeof v === 'number')}
          getLabel={(o) => getTerritoryScopeLabel(o) ?? ''}
        />
      );
    case Field.ISOStatus:
      return (
        <EnumButtonsMultiSelect
          paramKey="isoStatus"
          options={Object.values(LanguageISOStatus).filter((v) => typeof v === 'number')}
          getLabel={(o) => getLanguageISOStatusLabel(o) ?? ''}
        />
      );
    case Field.Name:
      return <SubstringFilterSelector />;
    case Field.SourceForLanguage:
      return <LanguageSourceSelector />;
    case Field.Population:
      return <PopulationFilterSelector />;
    case Field.Organization:
      return <OrganizationFilterSelector />;
    default:
      return null;
  }
};

export default FilterSelector;
