import { ArrowLeftRightIcon, BlocksIcon, CodeIcon, PencilLineIcon, UsersIcon } from 'lucide-react';
import React from 'react';

import PopulationWarning from '@widgets/PopulationWarning';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';

import { WritingSystemData, WritingSystemScope } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

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
    ID,
    // languages,
    parentWritingSystem,
    populationUpperBound,
    rightToLeft,
    sample,
    scope,
    unicodeVersion,
  } = writingSystem;
  // const filterByScope = getScopeFilter();
  const { updatePageParams } = usePageParams();
  const population =
    populationUpperBound != null && populationUpperBound >= 100 ? populationUpperBound : null;

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={writingSystem} />
        </a>
        <ObjectSubtitle object={writingSystem} />
      </h3>
      {rightToLeft === true && <div>Right to Left</div>}
      {unicodeVersion === null && <div>Not supported by Unicode</div>}

      <CardField
        title="Sample"
        icon={PencilLineIcon}
        description="A Short example of how this writing system appears in text."
      >
        {sample != null && String(sample).trim().length > 0 ? (
          <span>{sample}</span>
        ) : (
          <Deemphasized>None</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Scope"
        icon={BlocksIcon}
        description="How this writing system is categorized (e.g. a standalone system, a group of systems, or a variation of another system)."
      >
        {scope != null ? (
          <div>
            <div>{String(scope)}</div>

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

            {scope === WritingSystemScope.Group && (
              <div>
                <Deemphasized>Contains: </Deemphasized>
                {containsWritingSystems && containsWritingSystems.length > 0 ? (
                  <CommaSeparated>
                    {containsWritingSystems.map((w) => (
                      <HoverableObjectName key={w.ID} object={w} />
                    ))}
                  </CommaSeparated>
                ) : (
                  <Deemphasized>None</Deemphasized>
                )}
              </div>
            )}
          </div>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Population"
        icon={UsersIcon}
        description="This is a very rough estimate based on adding the populations that use the languages for this writing system, it's likely 50% to 400% off of the actual estimate."
      >
        <PopulationWarning />
        {population != null ? (
          <CountOfPeople count={population} />
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Text direction"
        icon={ArrowLeftRightIcon}
        description="The direction text is typically written and read for this writing system."
      >
        {rightToLeft == null ? (
          <Deemphasized>Unknown</Deemphasized>
        ) : (
          <span>{rightToLeft ? 'Right to left' : 'Left to right'}</span>
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
          <span>Unicode {String(unicodeVersion)}</span>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      {/*} {languages && Object.values(languages).length > 0 && (
        <div>
          <label>Languages:</label>
          <CommaSeparated>
            {Object.values(languages)
              .filter(filterByScope)
              .map((lang) => (
                <HoverableObjectName key={lang.ID} object={lang} />
              ))}
          </CommaSeparated>
        </div>
      )} */}
    </div>
  );
};

export default WritingSystemCard;
