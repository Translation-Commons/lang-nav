import { PilcrowLeftIcon } from 'lucide-react';
import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';

import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import { Skeleton } from '@shared/ui/skeleton';

interface Props {
  writingSystem?: WritingSystemData;
}

const WritingSystemCard: React.FC<Props> = ({ writingSystem }) => {
  const { population: populationRaw, sample } = writingSystem ?? {};
  const population = populationRaw != null && populationRaw >= 100 ? populationRaw : null;

  return (
    <>
      <CardField field={Field.Example}>
        {writingSystem ? (
          sample?.trim() ? (
            <span>{sample}</span>
          ) : (
            <Deemphasized>Not available</Deemphasized>
          )
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.WritingSystemScope}>
        {writingSystem ? (
          <WritingSystemScopeDisplay writingSystem={writingSystem} />
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.Population}>
        {writingSystem ? <CountOfPeople count={population} /> : <Skeleton className="h-4 w-full" />}
      </CardField>

      <CardEntityField field={Field.LanguageList} ent={writingSystem} />

      <CardField field={Field.UnicodeVersion}>
        {writingSystem ? (
          <WritingSystemUnicodeDisplay writingSystem={writingSystem} />
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardExtraFields
        ent={writingSystem}
        excludeFields={[
          Field.Name,
          Field.Code,
          Field.Population,
          Field.PopulationWriting,
          Field.WritingSystemScope,
          Field.LanguageList,
          Field.UnicodeVersion,
          Field.Example,
        ]}
      />
    </>
  );
};

const WritingSystemScopeDisplay: React.FC<{ writingSystem: WritingSystemData }> = ({
  writingSystem: { scope, parentWritingSystem, containsWritingSystems },
}) => {
  if (scope == null) return <Deemphasized>Unknown</Deemphasized>;
  return (
    <div>
      {scope}

      {scope === WritingSystemScope.Variation && (
        <div>
          <Deemphasized>Variant of: </Deemphasized>
          {parentWritingSystem ? (
            <HoverableEntityName ent={parentWritingSystem} />
          ) : (
            <Deemphasized>Unknown</Deemphasized>
          )}
        </div>
      )}

      {scope === WritingSystemScope.Group && containsWritingSystems?.length && (
        <>
          {' '}
          containing{' '}
          <CommaSeparated>
            {containsWritingSystems.map((w) => (
              <HoverableEntityName key={w.ID} ent={w} />
            ))}
          </CommaSeparated>
        </>
      )}
    </div>
  );
};

const WritingSystemUnicodeDisplay: React.FC<{ writingSystem: WritingSystemData }> = ({
  writingSystem: { unicodeVersion, rightToLeft },
}) => {
  return (
    <>
      {unicodeVersion === null ? (
        <Deemphasized>Not supported by Unicode</Deemphasized>
      ) : unicodeVersion != null ? (
        <>Unicode {unicodeVersion}</>
      ) : (
        <Deemphasized>Unknown</Deemphasized>
      )}
      {rightToLeft === true && (
        <>
          {' '}
          <Hoverable hoverContent="This writing system is written right to left; interfaces must handle this or risk disruptive display bugs for text in this writing system.">
            <PilcrowLeftIcon color="var(--color-yellow)" size="1em" />
          </Hoverable>
        </>
      )}
    </>
  );
};

export default WritingSystemCard;
