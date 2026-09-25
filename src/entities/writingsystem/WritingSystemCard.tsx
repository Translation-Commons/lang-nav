import { PilcrowLeftIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import EntityTitle from '@entities/ui/EntityTitle';
import { WritingSystemData, WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

interface Props {
  writingSystem: WritingSystemData;
}

const WritingSystemCard: React.FC<Props> = ({ writingSystem }) => {
  const {
    containsWritingSystems,
    languages,
    parentWritingSystem,
    populationUpperBound,
    rightToLeft,
    sample,
    scope,
    unicodeVersion,
  } = writingSystem;
  const population =
    populationUpperBound != null && populationUpperBound >= 100 ? populationUpperBound : null;

  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Code,
    Field.Population,
    Field.PopulationWriting,
    Field.WritingSystemScope,
    Field.LanguageList,
    Field.UnicodeVersion,
    Field.Example,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={writingSystem} />
      </div>

      <CardField field={Field.Example}>
        {sample?.trim() ? <span>{sample}</span> : <Deemphasized>Not available</Deemphasized>}
      </CardField>

      <CardField field={Field.WritingSystemScope}>
        {scope != null ? (
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
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField field={Field.Population}>
        <CountOfPeople count={population} />
      </CardField>

      <CardField field={Field.LanguageList}>
        {languages && Object.values(languages).length > 0 ? (
          <CommaSeparated>
            {Object.values(languages).map((lang) => (
              <HoverableEntityName key={lang.ID} ent={lang} />
            ))}
          </CommaSeparated>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField field={Field.UnicodeVersion}>
        {unicodeVersion === null ? (
          <span>Not supported by Unicode</span>
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
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={writingSystem} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default WritingSystemCard;
