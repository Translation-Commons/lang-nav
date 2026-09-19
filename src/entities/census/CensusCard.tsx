import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

import { CensusData } from './CensusTypes';
import { getCensusLanguageUse } from './getCensusLanguageUse';

interface Props {
  census: CensusData;
}
const CensusCard: React.FC<Props> = ({ census }) => {
  const { isoRegionCode, territory, yearCollected, languageCount } = census;
  const languageUse = getCensusLanguageUse(census);
  const extraFields = useActiveTransforms([
    Field.Name,
    Field.TerritoryPrimary,
    Field.Organization,
    Field.CountOfLanguages,
    Field.Modality,
    Field.Date,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={census} />
      </div>
      <CardField field={Field.TerritoryPrimary}>
        {territory != null ? <HoverableEntityName ent={territory} /> : isoRegionCode}
      </CardField>

      <CardField
        title="Collector"
        field={Field.SourceType}
        description="The type of organization that collected this census and/or presented it"
      >
        <div>
          {census.collector && <HoverableEntityName ent={census.collector} />}
          {census.presenter && (
            <>
              {' '}
              via <HoverableEntityName ent={census.presenter} style={{ display: 'inline' }} />
            </>
          )}
        </div>
      </CardField>

      <CardField field={Field.Date}>{yearCollected}</CardField>

      <CardField field={Field.Modality}>
        {languageUse != null ? languageUse : <Deemphasized>Unspecified</Deemphasized>}
      </CardField>

      <CardField field={Field.CountOfLanguages}>{languageCount.toLocaleString()}</CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={census} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default CensusCard;
