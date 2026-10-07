import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import Deemphasized from '@shared/ui/Deemphasized';

import { OrthographyData } from './OrthographyTypes';

type Props = {
  orthography: OrthographyData;
};

const OrthographyDetails: React.FC<Props> = ({ orthography }) => {
  const { language, writingSystem, baseCharacters, scriptCode } = orthography;

  const langHasMultipleInstances =
    language &&
    language.orthographies &&
    language.orthographies.some((o) => o.ID !== orthography.ID && o.scriptCode === scriptCode);

  return (
    <div className="Details">
      <DetailsSection title="Definition">
        <DetailsField title="Language">
          {language ? <HoverableEntityName ent={language} /> : <Deemphasized>Unknown</Deemphasized>}
        </DetailsField>
        <DetailsField title="Writing System">
          {writingSystem ? (
            <HoverableEntityName ent={writingSystem} />
          ) : (
            <Deemphasized>Unknown</Deemphasized>
          )}
        </DetailsField>
        {langHasMultipleInstances && (
          <DetailsField title="Instance">{orthography.instance.toLocaleString()}</DetailsField>
        )}
      </DetailsSection>

      <DetailsSection title="Attributes">
        <DetailsField title="Base Characters">
          {baseCharacters ? (
            <div className="flex flex-wrap gap-2">
              {baseCharacters.split(' ').map((char, i) => (
                <span
                  key={i}
                  className="inline-flex items-center justify-center w-8 h-8 border border-button-secondary rounded"
                >
                  {char}
                </span>
              ))}
            </div>
          ) : (
            <Deemphasized>Not available</Deemphasized>
          )}
        </DetailsField>
      </DetailsSection>
    </div>
  );
};

export default OrthographyDetails;
