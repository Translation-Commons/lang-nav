import { PilcrowLeftIcon } from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

import CardTitleBlock from '@entities/ui/CardTitleBlock';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/old/CommaSeparated';
import CountOfPeople from '@shared/ui/old/CountOfPeople';
import Deemphasized from '@shared/ui/old/Deemphasized';

interface Props {
  writingSystem: WritingSystemData;
}

const WritingSystemCard: React.FC<Props> = ({ writingSystem }) => {
  const { languages, populationUpperBound, rightToLeft, sample, unicodeVersion } = writingSystem;
  const population =
    populationUpperBound != null && populationUpperBound >= 100 ? populationUpperBound : null;

  return (
    <div>
      <CardTitleBlock object={writingSystem} />

      <CardField
        title="Sample"
        field={Field.Example}
        description="A single character from this writing system."
      >
        {sample?.trim() ? <span>{sample}</span> : <Deemphasized>Not available</Deemphasized>}
      </CardField>

      <CardField
        title="Population"
        field={Field.Population}
        description="This is a very rough estimate based on adding the populations that use the languages for this writing system, it's likely 50% to 400% off of the actual population."
      >
        <CountOfPeople count={population} />
      </CardField>

      <CardField
        title="Languages"
        field={Field.Language}
        description="Languages that use this writing system."
      >
        {languages && Object.values(languages).length > 0 ? (
          <CommaSeparated>
            {Object.values(languages).map((lang) => (
              <HoverableObjectName key={lang.ID} object={lang} />
            ))}
          </CommaSeparated>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Unicode support"
        field={Field.UnicodeVersion}
        description="Whether this writing system is encoded in Unicode, which affects support across fonts, operating systems, and software."
      >
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
    </div>
  );
};

export default WritingSystemCard;
