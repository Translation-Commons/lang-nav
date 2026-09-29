import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { OrthographyData } from '@entities/orthography/OrthographyTypes';
import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

import OrthographyCharacters from './OrthographyCharacters';

interface Props {
  orthography: OrthographyData;
}

const OrthographyCard: React.FC<Props> = ({ orthography }) => {
  const { language, writingSystem, baseCharacters } = orthography;

  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Code,
    Field.LanguagePrimary,
    Field.WritingSystem,
    Field.Example,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={orthography} />
      </div>

      <CardField field={Field.LanguagePrimary}>
        {language ? <HoverableEntityName ent={language} /> : <Deemphasized>Unknown</Deemphasized>}
      </CardField>

      <CardField field={Field.WritingSystem}>
        {writingSystem ? (
          <HoverableEntityName ent={writingSystem} />
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField field={Field.Example}>
        {baseCharacters ? (
          <OrthographyCharacters chars={baseCharacters} />
        ) : (
          <Deemphasized>Not available</Deemphasized>
        )}
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={orthography} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default OrthographyCard;
