import React from 'react';

import { getScopeFilter } from '../../controls/filter';
import { usePageParams } from '../../controls/PageParamsContext';
import CommaSeparated from '../../generic/CommaSeparated';
import { WritingSystemData, WritingSystemScope } from '../../types/DataTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectTitle from '../common/ObjectTitle';
import PopulationWarning from '../common/PopulationWarning';

interface Props {
  writingSystem: WritingSystemData;
}

const WritingSystemCard: React.FC<Props> = ({ writingSystem }) => {
  const {
    containsWritingSystems,
    ID,
    languages,
    parentWritingSystem,
    populationUpperBound,
    rightToLeft,
    sample,
    scope,
    unicodeVersion,
  } = writingSystem;
  const filterByScope = getScopeFilter();
  const { updatePageParams } = usePageParams();

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={writingSystem} highlightSearchMatches={true} />
        </a>
      </h3>
      {rightToLeft === true && <div>Right to Left</div>}
      {unicodeVersion === null && <div>Not supported by Unicode</div>}
      {sample != null && (
        <div>
          <h4>Sample</h4>
          {sample}
        </div>
      )}
      {Object.values(languages).length > 0 && (
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
      )}
      {populationUpperBound > 100 && ( // Values less than 100 are suspcious and probably spurious
        <div>
          <label>
            Population (Upper bound
            <PopulationWarning />
            {'):'}
          </label>
          {populationUpperBound.toLocaleString()}
        </div>
      )}
      {scope === WritingSystemScope.Variation && parentWritingSystem && (
        <div>
          <label>Variant of:</label>
          <HoverableObjectName object={parentWritingSystem} />
        </div>
      )}
      {scope == WritingSystemScope.Group && containsWritingSystems.length > 0 && (
        <div>
          <label>Contains:</label>
          <CommaSeparated>
            {containsWritingSystems.map((w) => (
              <HoverableObjectName key={w.ID} object={w} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </div>
  );
};

export default WritingSystemCard;
