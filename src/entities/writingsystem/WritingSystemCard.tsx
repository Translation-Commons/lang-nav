import {
  BlocksIcon,
  CodeIcon,
  LanguagesIcon,
  PencilLineIcon,
  PilcrowLeftIcon,
  UsersIcon,
} from 'lucide-react';
import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import ObjectTitle from '@entities/ui/ObjectTitle';
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

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={writingSystem} />
      </div>

      <CardField
        title="Sample"
        icon={PencilLineIcon}
        description="A single character from this writing system."
      >
        {sample?.trim() ? <span>{sample}</span> : <Deemphasized>Not available</Deemphasized>}
      </CardField>

      <CardField
        title="Scope"
        icon={BlocksIcon}
        description="How this writing system is categorized (e.g. a standalone system, a group of systems, or a variation of another system)."
      >
        {scope != null ? (
          <div>
            {scope}

            {scope === WritingSystemScope.Variation && (
              <div>
                <Deemphasized>Variant of: </Deemphasized>
                {parentWritingSystem ? (
                  <HoverableObjectName object={parentWritingSystem} />
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
                    <HoverableObjectName key={w.ID} object={w} />
                  ))}
                </CommaSeparated>
              </>
            )}
          </div>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Population"
        icon={UsersIcon}
        description="This is a very rough estimate based on adding the populations that use the languages for this writing system, it's likely 50% to 400% off of the actual population."
      >
        <CountOfPeople count={population} />
      </CardField>

      <CardField
        title="Languages"
        icon={LanguagesIcon}
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
        icon={CodeIcon}
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
              <PilcrowLeftIcon color="var(--color-text-yellow)" size="1em" />
            </Hoverable>
          </>
        )}
      </CardField>
    </div>
  );
};

export default WritingSystemCard;
