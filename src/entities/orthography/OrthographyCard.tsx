import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';

import { OrthographyData } from '@entities/orthography/OrthographyTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import { Skeleton } from '@shared/ui/skeleton';

import OrthographyCharacters from './OrthographyCharacters';

interface Props {
  orthography?: OrthographyData;
}

const OrthographyCard: React.FC<Props> = ({ orthography }) => {
  return (
    <>
      <CardEntityField field={Field.LanguagePrimary} ent={orthography} />

      <CardField field={Field.WritingSystem}>
        {orthography ? (
          orthography?.writingSystem ? (
            <HoverableEntityName ent={orthography.writingSystem} />
          ) : (
            <Deemphasized>Unknown</Deemphasized>
          )
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.Characters}>
        {orthography ? (
          orthography?.baseCharacters ? (
            <OrthographyCharacters chars={orthography.baseCharacters} />
          ) : (
            <Deemphasized>Not available</Deemphasized>
          )
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardExtraFields
        ent={orthography}
        excludeFields={[
          Field.Name,
          Field.Code,
          Field.LanguagePrimary,
          Field.WritingSystem,
          Field.Characters,
        ]}
      />
    </>
  );
};

export default OrthographyCard;
