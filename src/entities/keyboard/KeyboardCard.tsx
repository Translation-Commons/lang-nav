import { KeyboardIcon, LanguagesIcon, MapPinIcon, PencilLineIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/CommaSeparated';

interface Props {
  keyboard: KeyboardData;
}

const KeyboardCard: React.FC<Props> = ({ keyboard }) => {
  const {
    nameDisplay,
    platform,
    language,
    territory,
    inputWritingSystem,
    outputWritingSystem,
    variantTag,
  } = keyboard;

  const sameScript = keyboard.inputScriptCode === keyboard.outputScriptCode;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>{nameDisplay}</div>
      <CardField
        title="Platform"
        icon={KeyboardIcon}
        description="The keyboard platform this layout belongs to."
      >
        {platform}
      </CardField>

      {language != null && (
        <CardField
          title="Language"
          icon={LanguagesIcon}
          description="The language this keyboard is designed for."
        >
          <HoverableObjectName object={language} />
        </CardField>
      )}

      {inputWritingSystem != null && (
        <CardField
          title="Writing System"
          icon={PencilLineIcon}
          description={
            sameScript
              ? 'The writing system used by this keyboard.'
              : 'The input and output writing systems for this keyboard.'
          }
        >
          {sameScript ? (
            <HoverableObjectName object={inputWritingSystem} />
          ) : (
            <>
              <HoverableObjectName object={inputWritingSystem} />
              {' → '}
              {outputWritingSystem != null && <HoverableObjectName object={outputWritingSystem} />}
            </>
          )}
        </CardField>
      )}

      {(territory != null || variantTag != null) && (
        <CardField
          title="Variation"
          icon={MapPinIcon}
          description="Territory or variant tag that further specifies this keyboard layout."
        >
          <CommaSeparated>
            {territory != null && <HoverableObjectName object={territory} />}
            {variantTag != null && <HoverableObjectName object={variantTag} />}
          </CommaSeparated>
        </CardField>
      )}
    </div>
  );
};

export default KeyboardCard;
